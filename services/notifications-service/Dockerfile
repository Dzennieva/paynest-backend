FROM node:20-alpine AS builder

RUN apk upgrade --no-cache

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2: Testing ─────────────────────────────────────────────

FROM builder AS test

COPY jest.config.js jest.setup.js ./

COPY /src ./src

RUN npm test

# ── Stage 3: Production build ────────────────────────────────────
FROM node:20-alpine AS production

RUN apk upgrade --no-cache

RUN addgroup -S paynest && adduser -S paynest -G paynest

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile --omit=dev

COPY --from=test /app/src ./src

USER paynest

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "src/index.js"]