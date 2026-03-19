FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ ./backend/
COPY *.html *.js *.css ./

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=builder /app .
RUN mkdir -p backend/uploads backend/backups backend/logs backend/database
EXPOSE 3001
ENV NODE_ENV=production
USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/server.js"]
