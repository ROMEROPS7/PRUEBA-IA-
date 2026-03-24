# SiniestrosAI - Production Dockerfile
FROM node:20-alpine AS base

# Security: run as non-root
RUN addgroup -g 1001 -S siniestros && \
    adduser -S siniestros -u 1001 -G siniestros

WORKDIR /app

# Install dependencies first (better caching)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy frontend files
COPY *.html *.js *.css ./
COPY js/ ./js/

# Security headers
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

# Non-root user
USER siniestros

EXPOSE 3001

CMD ["node", "backend/src/server.js"]
