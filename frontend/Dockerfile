# Stage 1: Build the application
FROM oven/bun:1 AS builder

WORKDIR /app

# Set NODE_ENV for Next.js build optimizations and other environment variables
# Variables starting with NEXT_PUBLIC_ will be embedded into the client-side bundle.
# Other variables are for server-side use.
# These should be passed as build arguments if needed during 'bun run build'.
# Example: docker build --build-arg NEXT_PUBLIC_API_URL=your_api_url -t your-image .
# ARG NEXT_PUBLIC_MY_VARIABLE
# ENV NEXT_PUBLIC_MY_VARIABLE=${NEXT_PUBLIC_MY_VARIABLE}

ENV NODE_ENV=production

# Copy package.json and bun.lock (Bun's lockfile)
COPY package.json bun.lock ./

# Install dependencies
# Using --frozen-lockfile ensures that the exact dependencies from bun.lock are installed.
RUN bun install --frozen-lockfile

# Copy the rest of the application code
# This includes app/, components/, lib/, public/, next.config.js, tsconfig.json, middleware.ts, prisma/, etc.
COPY . .

# If your project uses Prisma, ensure 'prisma generate' is part of your 'build' script in package.json
# Example package.json script: "build": "prisma generate && next build"
# The Prisma client will then be generated during the build process.
RUN bun run build

# Stage 2: Production image
# Use a slim base image for a smaller final image size
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json and bun.lock from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# Install only production dependencies
# This helps in reducing the size of the final image by excluding development dependencies.
RUN bun install --production --frozen-lockfile

# Copy the built Next.js application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# next.config.js is often needed at runtime by 'next start'
COPY --from=builder /app/next.config.js ./next.config.js

# If your middleware.ts is not automatically included in the .next build output in a way
# that `next start` can find it, you might need to copy it.
# However, typically it's compiled and part of the .next/server directory.
# COPY --from=builder /app/middleware.ts ./middleware.ts

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Define the command to start the Next.js application
# This assumes your package.json has a "start" script, e.g., "next start"
CMD ["bun", "run", "start"]

# --- Environment Variable Notes ---
# The Next.js application will require various environment variables at runtime,
# such as those defined in your .env file (e.g., NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL, etc.).
#
# How to provide them to the Docker container:
# 1. Using 'docker run -e VARNAME=value ...' for each variable.
# 2. Using 'docker run --env-file ./path/to/your/.env.production ...' to pass a file with variable definitions.
#    (Ensure this .env.production file contains only necessary runtime variables and is kept secure).
#
# Do NOT bake sensitive secrets directly into the Docker image by copying the .env file or using hardcoded ENV instructions for secrets.
#
# Example variables from your .env that would be needed at RUNTIME:
# - NEXTAUTH_URL (e.g., http://yourdomain.com)
# - NEXTAUTH_SECRET (a strong, random secret)
# - DATABASE_URL (connection string for Prisma/NextAuth database adapter)
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - GITHUB_CLIENT_ID
# - GITHUB_CLIENT_SECRET
# - EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM
# - BACKEND_URL (e.g., http://backend-service-name:8000 if using Docker Compose, or the public URL of your backend)
#
# Variables prefixed with NEXT_PUBLIC_ are embedded at BUILD time.
# If these come from your .env file, ensure they are available during the `docker build` process
# (e.g., via --build-arg as shown in the builder stage comments, or by your CI system).
