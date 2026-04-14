# =============================================================================
# PPOBA Backend — Multi-stage Dockerfile for Fly.io deployment
# =============================================================================

# ---------- Stage 1: Build ----------
FROM node:18-slim AS builder

# Install pnpm 8.x (matches lockfileVersion 6.1)
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy workspace config & lockfile first (layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.common.json ./

# Copy only the packages needed for the backend build
COPY packages/types/package.json packages/types/tsconfig.json packages/types/tsconfig.build.json packages/types/tsconfig.esm.json ./packages/types/
COPY packages/service-backend/package.json packages/service-backend/tsconfig.json packages/service-backend/tsconfig.build.json packages/service-backend/webpack.config.ts ./packages/service-backend/

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/types/src ./packages/types/src
COPY packages/service-backend/src ./packages/service-backend/src

# Copy swagger docs (used by backend build)
COPY script-docs ./script-docs

# Build @ppoba/types first (backend depends on it)
RUN pnpm --filter types build

# Build backend with webpack (entry.local.ts → dist/index.js)
# ts-patch is installed via the `prepare` script during pnpm install
RUN cd packages/service-backend && npx webpack

# ---------- Stage 2: Runtime ----------
FROM node:18-slim AS runtime

WORKDIR /app

# Copy only the webpack bundle output (single file)
COPY --from=builder /app/packages/service-backend/dist/index.js ./dist/index.js
COPY --from=builder /app/packages/service-backend/dist/index.js.map ./dist/index.js.map

# Fly.io injects PORT=8080 by default
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
