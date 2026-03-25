FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2: Testing ─────────────────────────────────────────────
# This stage runs tests during the CI pipeline
# It will never be deployed — it exists only to verify the code

FROM builder AS test

COPY jest.config.js jest.setup.js ./

COPY /src ./src

RUN npm test

# ── Stage 3: Production build ────────────────────────────────────
# This is the final stage — the actual image that runs in production
# It starts fresh from a minimal base image
FROM node:18-alpine AS production

RUN addgroup -S paynest && adduser -S paynest -G paynest

WORKDIR /app

COPY package.json package-lock.json ./

# Install ONLY production dependencies — no jest, no nodemon, no dev tools
# --omit=dev drops everything in devDependencies
RUN npm ci --frozen-lockfile --omit=dev

# Copy source code from the test stage
# This ensures only tested code makes it into the production image
COPY --from=test /app/src ./src

# Switch to the non-root user we created above
USER paynest

EXPOSE 3001

# Healthcheck — Docker and Kubernetes use this to know if the container is healthy
# If this fails repeatedly, Kubernetes restarts the pod automatically
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/index.js"]




