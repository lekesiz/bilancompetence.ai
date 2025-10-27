# ============================================
# BilanCompetence.AI - Backend Dockerfile
# ============================================

# Stage 1: Base
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8

# Set working directory
WORKDIR /app

# ============================================
# Stage 2: Dependencies
FROM base AS dependencies

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: Builder
FROM base AS builder

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build

# ============================================
# Stage 4: Production
FROM base AS production

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Create logs directory
RUN mkdir -p /app/logs

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]

# ============================================
# Stage 5: Development
FROM base AS development

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start development server with hot reload
CMD ["pnpm", "run", "dev"]

