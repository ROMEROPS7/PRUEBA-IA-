"""
Persistent memory for agent, task, and workflow data.

Ported from ruflo v3/src/memory/domain/Memory.ts
SQLite-backed storage with query and vector search capabilities.

Powered by ruflo (github.com/ruvnet/ruflo) - ported to Python for SegurCaixa Adeslas
"""

import logging
import sqlite3
import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
from pathlib import Path
import uuid

from .types import Memory, MemoryQuery, MemoryType

logger = logging.getLogger(__name__)


class MemoryEntity:
    """
    Persistent memory backend for storing and retrieving agent data.
    Uses SQLite for durability and supports complex queries.
    """

    def __init__(self, db_path: str = ":memory:"):
        """
        Initialize memory entity.

        Args:
            db_path: Path to SQLite database (default: in-memory)
        """
        self.db_path = db_path
        self.conn: Optional[sqlite3.Connection] = None
        self._initialize_database()

        logger.info(f"Initialized MemoryEntity with db: {db_path}")

    def _initialize_database(self) -> None:
        """Initialize SQLite database schema."""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
            cursor = self.conn.cursor()

            # Create memory table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS memory (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    key TEXT NOT NULL,
                    value TEXT,
                    metadata TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    ttl_seconds INTEGER,
                    UNIQUE(type, key)
                )
                """
            )

            # Create indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_type ON memory(type)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_key ON memory(key)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_created ON memory(created_at)")

            self.conn.commit()
            logger.info("Database schema initialized")

        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise

    def store(self, memory: Memory) -> None:
        """
        Store a memory entry.

        Args:
            memory: Memory object to store
        """
        if not self.conn:
            raise RuntimeError("Database not initialized")

        try:
            cursor = self.conn.cursor()

            # Serialize value and metadata
            value_json = json.dumps(memory.value) if memory.value is not None else None
            metadata_json = json.dumps(memory.metadata)

            cursor.execute(
                """
                INSERT OR REPLACE INTO memory
                (id, type, key, value, metadata, created_at, updated_at, ttl_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    memory.id,
                    memory.type.value,
                    memory.key,
                    value_json,
                    metadata_json,
                    memory.created_at.isoformat(),
                    memory.updated_at.isoformat(),
                    memory.ttl_seconds,
                ),
            )

            self.conn.commit()
            logger.debug(f"Stored memory {memory.id} with key {memory.key}")

        except Exception as e:
            logger.error(f"Error storing memory: {e}")
            raise

    def retrieve(self, memory_id: str) -> Optional[Memory]:
        """
        Retrieve a memory entry by ID.

        Args:
            memory_id: ID of memory to retrieve

        Returns:
            Memory object or None if not found
        """
        if not self.conn:
            raise RuntimeError("Database not initialized")

        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM memory WHERE id = ?", (memory_id,))
            row = cursor.fetchone()

            if not row:
                return None

            return self._row_to_memory(row)

        except Exception as e:
            logger.error(f"Error retrieving memory: {e}")
            return None

    def update(self, memory: Memory) -> None:
        """
        Update a memory entry.

        Args:
            memory: Memory object with updated values
        """
        memory.updated_at = datetime.utcnow()
        self.store(memory)

    def delete(self, memory_id: str) -> None:
        """
        Delete a memory entry.

        Args:
            memory_id: ID of memory to delete
        """
        if not self.conn:
            raise RuntimeError("Database not initialized")

        try:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM memory WHERE id = ?", (memory_id,))
            self.conn.commit()
            logger.debug(f"Deleted memory {memory_id}")

        except Exception as e:
            logger.error(f"Error deleting memory: {e}")
            raise

    def query(self, query: MemoryQuery) -> List[Memory]:
        """
        Query memory entries.

        Args:
            query: MemoryQuery with filters

        Returns:
            List of matching Memory objects
        """
        if not self.conn:
            raise RuntimeError("Database not initialized")

        try:
            cursor = self.conn.cursor()

            # Build query
            sql = "SELECT * FROM memory WHERE 1=1"
            params = []

            if query.type:
                sql += " AND type = ?"
                params.append(query.type.value)

            if query.key:
                sql += " AND key = ?"
                params.append(query.key)

            # Add metadata filters
            if query.metadata_filters:
                for key, value in query.metadata_filters.items():
                    sql += " AND json_extract(metadata, ?) = ?"
                    params.extend([f"$.{key}", json.dumps(value)])

            # Add pattern matching for key
            if query.pattern:
                sql += " AND key REGEXP ?"
                params.append(query.pattern)

            # Add ordering and limits
            sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
            params.extend([query.limit, query.offset])

            cursor.execute(sql, params)
            rows = cursor.fetchall()

            results = []
            for row in rows:
                memory = self._row_to_memory(row)
                # Check expiration
                if not memory.is_expired():
                    results.append(memory)
                else:
                    # Remove expired entries
                    self.delete(memory.id)

            return results

        except Exception as e:
            logger.error(f"Error querying memory: {e}")
            return []

    def vector_search(
        self,
        embedding: List[float],
        k: int = 10,
        memory_type: Optional[MemoryType] = None,
    ) -> List[Memory]:
        """
        Vector search in memory (placeholder for future HNSW implementation).

        Args:
            embedding: Query embedding vector
            k: Number of results to return
            memory_type: Optional filter by memory type

        Returns:
            List of similar Memory objects
        """
        # TODO: Implement HNSW vector search when vector library is available
        logger.warning("Vector search not yet implemented")

        if memory_type:
            query = MemoryQuery(type=memory_type, limit=k)
            return self.query(query)

        query = MemoryQuery(limit=k)
        return self.query(query)

    def clear_expired(self) -> int:
        """
        Clear expired memory entries.

        Returns:
            Number of entries deleted
        """
        if not self.conn:
            raise RuntimeError("Database not initialized")

        try:
            cursor = self.conn.cursor()

            # Get all entries with TTL
            cursor.execute(
                """
                SELECT id, created_at, ttl_seconds FROM memory
                WHERE ttl_seconds IS NOT NULL
                """
            )
            rows = cursor.fetchall()

            now = datetime.utcnow()
            deleted_count = 0

            for row in rows:
                created = datetime.fromisoformat(row[1])
                ttl = row[2]
                if (now - created).total_seconds() > ttl:
                    self.delete(row[0])
                    deleted_count += 1

            logger.info(f"Cleared {deleted_count} expired memory entries")
            return deleted_count

        except Exception as e:
            logger.error(f"Error clearing expired entries: {e}")
            return 0

    @staticmethod
    def create_task_memory(task_id: str, task_data: Dict[str, Any]) -> Memory:
        """
        Factory method to create task memory.

        Args:
            task_id: ID of task
            task_data: Task data

        Returns:
            Memory object configured for tasks
        """
        return Memory(
            id=str(uuid.uuid4()),
            type=MemoryType.TASK,
            key=f"task:{task_id}",
            value=task_data,
            metadata={"task_id": task_id},
            ttl_seconds=86400,  # 24 hours
        )

    @staticmethod
    def create_context_memory(
        context_id: str,
        context_data: Dict[str, Any],
    ) -> Memory:
        """
        Factory method to create context memory.

        Args:
            context_id: ID of context
            context_data: Context data

        Returns:
            Memory object configured for context
        """
        return Memory(
            id=str(uuid.uuid4()),
            type=MemoryType.CONTEXT,
            key=f"context:{context_id}",
            value=context_data,
            metadata={"context_id": context_id},
            ttl_seconds=3600,  # 1 hour
        )

    @staticmethod
    def create_event_memory(
        event_type: str,
        event_data: Dict[str, Any],
    ) -> Memory:
        """
        Factory method to create event memory.

        Args:
            event_type: Type of event
            event_data: Event data

        Returns:
            Memory object configured for events
        """
        return Memory(
            id=str(uuid.uuid4()),
            type=MemoryType.EVENT,
            key=f"event:{event_type}:{datetime.utcnow().timestamp()}",
            value=event_data,
            metadata={"event_type": event_type},
            ttl_seconds=2592000,  # 30 days
        )

    def _row_to_memory(self, row: sqlite3.Row) -> Memory:
        """Convert database row to Memory object."""
        value = None
        if row["value"]:
            try:
                value = json.loads(row["value"])
            except json.JSONDecodeError:
                value = row["value"]

        metadata = {}
        if row["metadata"]:
            try:
                metadata = json.loads(row["metadata"])
            except json.JSONDecodeError:
                metadata = {}

        return Memory(
            id=row["id"],
            type=MemoryType(row["type"]),
            key=row["key"],
            value=value,
            metadata=metadata,
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
            ttl_seconds=row["ttl_seconds"],
        )

    def close(self) -> None:
        """Close database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None
            logger.info("Closed database connection")

    def __repr__(self) -> str:
        """String representation of memory entity."""
        return f"MemoryEntity(db_path={self.db_path})"
