# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat openssl \
    && corepack enable

FROM base AS deps
ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/next_app?schema=public
ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS dev
ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/next_app?schema=public
ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["pnpm", "dev"]

FROM base AS builder
ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/next_app?schema=public
ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
