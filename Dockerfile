# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /workspace
COPY . .
RUN pnpm --filter @repo/db generate
RUN pnpm --filter web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV="production"
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /workspace/apps/web/next.config.ts ./next.config.ts
COPY --from=builder /workspace/apps/web/public ./apps/web/public
COPY --from=builder /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /workspace/apps/web/.next/standalone ./

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
