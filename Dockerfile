# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0
FROM node:${NODE_VERSION}-bookworm-slim AS base

WORKDIR /app

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public" pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public" pnpm prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/healthz').then(res => { if (!res.ok) process.exit(1); }).catch(() => process.exit(1));"

CMD ["pnpm", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
