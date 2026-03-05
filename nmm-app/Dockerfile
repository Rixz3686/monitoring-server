FROM oven/bun:1 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lockb* ./
RUN bun install
COPY frontend/ .
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app/backend
COPY backend/package.json backend/bun.lockb* ./
RUN bun install --production
COPY backend/ .
COPY --from=frontend-builder /app/frontend/dist ./public
EXPOSE 3002
CMD ["bun", "run", "server.ts"]
