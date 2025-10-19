# Development Dockerfile for Next.js + Prisma
FROM node:20-bookworm-slim

ENV NODE_ENV=development
WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

# Install system dependencies usually required by Prisma engines
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies first (leverage Docker layer caching)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

# Copy the rest of the project
COPY . .

# Generate Prisma Client
RUN pnpm prisma:generate || true

EXPOSE 3000
CMD ["pnpm", "dev"]
