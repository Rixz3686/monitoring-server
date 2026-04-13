FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 5173
CMD ["bunx", "sirv-cli", "dist", "--port", "5173", "--single", "--host", "0.0.0.0"]