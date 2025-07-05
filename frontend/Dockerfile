# Stage 1: Build the application
FROM oven/bun:1 AS builder

WORKDIR /app

# Set NODE_ENV for Next.js build optimizations
ENV NODE_ENV=production

# Switch to root to install packages and set permissions
USER root
RUN apt-get update -y && \
    apt-get install -y \
    openssl \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy all application files first.
COPY . .

# Change ownership of the /app directory to the bun user
RUN chown -R bun:bun /app

# Switch to the bun user for subsequent commands
USER bun

# Install dependencies using bun.
# bun install should now have the necessary permissions.
RUN bun install --frozen-lockfile

# If your project uses Prisma, ensure 'prisma generate' is part of your 'build' script in package.json
# Example package.json script: "build": "prisma generate && next build"
# The Prisma client will then be generated (or re-generated) during the build process.
RUN bun run build

# Stage 2: Production image
# Use a slim base image for a smaller final image size
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Switch to root for system operations like installing packages and changing ownership
USER root
RUN apt-get update -y && \
    apt-get install -y \
    openssl \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy necessary files from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/prisma/ ./prisma/ 

# Change ownership of the /app directory and its contents to the bun user
# This must be done as root before switching to the bun user
RUN chown -R bun:bun /app

# Switch to the bun user for subsequent commands
USER bun

# Install only production dependencies
# bun install should now have the necessary permissions to create node_modules
RUN bun install --production --frozen-lockfile

# Copy the built Next.js application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# next.config.js is often needed at runtime by 'next start'
COPY --from=builder /app/next.config.js ./next.config.js

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
