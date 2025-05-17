FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache git libc6-compat

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Copy the prisma directory
COPY prisma ./prisma

# Install dependencies with specific flags for performance
RUN yarn install --frozen-lockfile --production=true --network-timeout 300000

# Install dev dependencies for build
RUN yarn install --frozen-lockfile --network-timeout 300000

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure the .env file is copied for Prisma to use
COPY .env .env

# Generate Prisma client
RUN yarn prisma generate --schema=./prisma/schema.prisma

# Optimize build for production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build Next.js with optimizations
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Set Node.js performance flags
ENV NODE_OPTIONS="--max-old-space-size=2048 --max-http-header-size=16384 --use-openssl-ca --tls-min-v1.2 --no-warnings"

# Add compression and security headers
ENV NEXT_COMPRESS true

# Create system user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy optimized public assets
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Add performance optimization script
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Set server options
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start with optimized garbage collection
CMD ["node", "--optimize_for_size", "--gc_interval=100", "--max_old_space_size=2048", "server.js"]