# Multi-stage build for optimal image size and security
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code and docs
COPY src/ ./src/

# Compile TypeScript and copy static assets
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled files and docs from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/docs ./src/docs

# Security: Run as non-root node user
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]

