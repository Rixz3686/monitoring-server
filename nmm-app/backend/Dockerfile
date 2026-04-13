FROM oven/bun:latest
WORKDIR /app
RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*
COPY package.json bun.lock* ./
RUN bun install
COPY . .
EXPOSE 3002
CMD ["bun", "run", "server.ts"]