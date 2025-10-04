# Multi-stage build for production
FROM node:20-slim AS base

# Install dependencies for production
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Build stage (if needed in the future)
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Production stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy node_modules from deps stage
COPY --from=deps --chown=expressjs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=expressjs:nodejs . .

# Switch to non-root user
USER expressjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/index.js"]
