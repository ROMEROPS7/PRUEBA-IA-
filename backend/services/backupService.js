/**
 * Backup Service
 *
 * Provides SQLite database backup, restore, rotation, and scheduling.
 * All operations use real file I/O.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipe = promisify(pipeline);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'siniestros.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');

// Interval references for cleanup
let _hourlyInterval = null;
let _dailyInterval = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Ensures the backup directory exists. Creates it recursively if missing.
 * @returns {string} Absolute path to the backup directory.
 */
function getBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`[Backup] Created backup directory: ${BACKUP_DIR}`);
  }
  return BACKUP_DIR;
}

/**
 * Formats a Date into the YYYY-MM-DD_HH-mm pattern used in filenames.
 */
function _formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    '-', pad(date.getMonth() + 1),
    '-', pad(date.getDate()),
    '_',
    pad(date.getHours()),
    '-', pad(date.getMinutes()),
  ].join('');
}

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * backupNow()
 *
 * Creates an immediate copy of the active SQLite database file into the
 * backups directory with a timestamped filename.
 *
 * @returns {Promise<{name: string, path: string, size: number, date: Date}>}
 */
async function backupNow() {
  const dir = getBackupDir();

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Source database not found: ${DB_PATH}`);
  }

  const timestamp = _formatTimestamp(new Date());
  const backupName = `siniestros_${timestamp}.db`;
  const destPath = path.join(dir, backupName);

  await fs.promises.copyFile(DB_PATH, destPath);

  // Also copy WAL and SHM files if they exist (ensures a consistent snapshot)
  const walPath = DB_PATH + '-wal';
  const shmPath = DB_PATH + '-shm';
  if (fs.existsSync(walPath)) {
    await fs.promises.copyFile(walPath, destPath + '-wal');
  }
  if (fs.existsSync(shmPath)) {
    await fs.promises.copyFile(shmPath, destPath + '-shm');
  }

  const stats = await fs.promises.stat(destPath);

  console.log(`[Backup] Created: ${backupName} (${(stats.size / 1024).toFixed(1)} KB)`);

  return {
    name: backupName,
    path: destPath,
    size: stats.size,
    date: new Date(),
  };
}

/**
 * scheduleHourly()
 *
 * Sets up a recurring interval that creates a backup every hour.
 * Only one hourly schedule can be active at a time; calling again replaces
 * the previous interval.
 *
 * @returns {{ intervalId: object, stop: Function }}
 */
function scheduleHourly() {
  if (_hourlyInterval) {
    clearInterval(_hourlyInterval);
  }

  const ONE_HOUR = 60 * 60 * 1000;

  _hourlyInterval = setInterval(async () => {
    try {
      await backupNow();
      // Rotate after each backup to keep disk usage in check
      await rotateBackups();
    } catch (err) {
      console.error('[Backup] Hourly backup failed:', err.message);
    }
  }, ONE_HOUR);

  // Allow the process to exit even if the interval is pending
  if (_hourlyInterval.unref) _hourlyInterval.unref();

  console.log('[Backup] Hourly backup scheduled.');

  return {
    intervalId: _hourlyInterval,
    stop: () => {
      clearInterval(_hourlyInterval);
      _hourlyInterval = null;
      console.log('[Backup] Hourly backup stopped.');
    },
  };
}

/**
 * scheduleDailyCompressed()
 *
 * Sets up a recurring interval that creates a gzip-compressed backup once
 * per day.
 *
 * @returns {{ intervalId: object, stop: Function }}
 */
function scheduleDailyCompressed() {
  if (_dailyInterval) {
    clearInterval(_dailyInterval);
  }

  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Also run one immediately so we don't have to wait a full day
  _createCompressedBackup().catch((err) =>
    console.error('[Backup] Initial compressed backup failed:', err.message)
  );

  _dailyInterval = setInterval(async () => {
    try {
      await _createCompressedBackup();
      await rotateBackups();
    } catch (err) {
      console.error('[Backup] Daily compressed backup failed:', err.message);
    }
  }, ONE_DAY);

  if (_dailyInterval.unref) _dailyInterval.unref();

  console.log('[Backup] Daily compressed backup scheduled.');

  return {
    intervalId: _dailyInterval,
    stop: () => {
      clearInterval(_dailyInterval);
      _dailyInterval = null;
      console.log('[Backup] Daily compressed backup stopped.');
    },
  };
}

/**
 * Internal: creates a .db.gz compressed backup using zlib gzip.
 */
async function _createCompressedBackup() {
  const dir = getBackupDir();

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Source database not found: ${DB_PATH}`);
  }

  const timestamp = _formatTimestamp(new Date());
  const backupName = `siniestros_${timestamp}.db.gz`;
  const destPath = path.join(dir, backupName);

  const source = fs.createReadStream(DB_PATH);
  const gzip = zlib.createGzip({ level: zlib.constants.Z_BEST_COMPRESSION });
  const dest = fs.createWriteStream(destPath);

  await pipe(source, gzip, dest);

  const stats = await fs.promises.stat(destPath);
  console.log(`[Backup] Compressed: ${backupName} (${(stats.size / 1024).toFixed(1)} KB)`);

  return {
    name: backupName,
    path: destPath,
    size: stats.size,
    date: new Date(),
  };
}

/**
 * rotateBackups(maxDays)
 *
 * Deletes backup files that are older than `maxDays`.
 *
 * @param {number} [maxDays=30]
 * @returns {Promise<{deleted: string[], kept: number}>}
 */
async function rotateBackups(maxDays = 30) {
  const dir = getBackupDir();
  const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000;

  const entries = await fs.promises.readdir(dir);
  const deleted = [];
  let kept = 0;

  for (const entry of entries) {
    // Only consider backup files (skip unrelated files)
    if (!entry.startsWith('siniestros_')) continue;

    const fullPath = path.join(dir, entry);
    const stats = await fs.promises.stat(fullPath);

    if (stats.mtimeMs < cutoff) {
      await fs.promises.unlink(fullPath);
      deleted.push(entry);
    } else {
      kept++;
    }
  }

  if (deleted.length > 0) {
    console.log(`[Backup] Rotated: ${deleted.length} old backups deleted, ${kept} kept.`);
  }

  return { deleted, kept };
}

/**
 * listBackups()
 *
 * Returns an array of all backup files with metadata.
 *
 * @returns {Promise<Array<{name: string, size: number, sizeHuman: string, date: Date, compressed: boolean}>>}
 */
async function listBackups() {
  const dir = getBackupDir();

  let entries;
  try {
    entries = await fs.promises.readdir(dir);
  } catch (err) {
    // Directory might not exist yet
    return [];
  }

  const backups = [];

  for (const entry of entries) {
    if (!entry.startsWith('siniestros_')) continue;

    const fullPath = path.join(dir, entry);
    const stats = await fs.promises.stat(fullPath);

    // Skip WAL / SHM companion files in the listing
    if (entry.endsWith('-wal') || entry.endsWith('-shm')) continue;

    const sizeKB = stats.size / 1024;
    let sizeHuman;
    if (sizeKB >= 1024) {
      sizeHuman = `${(sizeKB / 1024).toFixed(2)} MB`;
    } else {
      sizeHuman = `${sizeKB.toFixed(1)} KB`;
    }

    backups.push({
      name: entry,
      size: stats.size,
      sizeHuman,
      date: stats.mtime,
      compressed: entry.endsWith('.gz'),
    });
  }

  // Sort newest first
  backups.sort((a, b) => b.date.getTime() - a.date.getTime());

  return backups;
}

/**
 * restore(backupName)
 *
 * Restores a backup by copying it over the active database file.
 * If the backup is gzip-compressed (.db.gz), it is decompressed first.
 *
 * @param {string} backupName – filename inside the backups directory
 * @returns {Promise<{restored: string, size: number}>}
 */
async function restore(backupName) {
  const dir = getBackupDir();
  const srcPath = path.join(dir, backupName);

  if (!fs.existsSync(srcPath)) {
    throw new Error(`Backup not found: ${backupName}`);
  }

  // Safety: create a pre-restore snapshot
  if (fs.existsSync(DB_PATH)) {
    const safetyName = `siniestros_pre-restore_${_formatTimestamp(new Date())}.db`;
    const safetyPath = path.join(dir, safetyName);
    await fs.promises.copyFile(DB_PATH, safetyPath);
    console.log(`[Backup] Pre-restore safety copy: ${safetyName}`);
  }

  // Remove WAL / SHM so SQLite re-opens cleanly
  for (const suffix of ['-wal', '-shm']) {
    const p = DB_PATH + suffix;
    if (fs.existsSync(p)) {
      await fs.promises.unlink(p);
    }
  }

  if (backupName.endsWith('.gz')) {
    // Decompress
    const source = fs.createReadStream(srcPath);
    const gunzip = zlib.createGunzip();
    const dest = fs.createWriteStream(DB_PATH);
    await pipe(source, gunzip, dest);
  } else {
    await fs.promises.copyFile(srcPath, DB_PATH);

    // Also restore companion WAL/SHM if present
    for (const suffix of ['-wal', '-shm']) {
      const companion = srcPath + suffix;
      if (fs.existsSync(companion)) {
        await fs.promises.copyFile(companion, DB_PATH + suffix);
      }
    }
  }

  const stats = await fs.promises.stat(DB_PATH);
  console.log(`[Backup] Restored from: ${backupName} (${(stats.size / 1024).toFixed(1)} KB)`);

  return { restored: backupName, size: stats.size };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  backupNow,
  scheduleHourly,
  scheduleDailyCompressed,
  rotateBackups,
  listBackups,
  restore,
  getBackupDir,
};
