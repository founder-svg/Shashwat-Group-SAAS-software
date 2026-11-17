# Multi-stage Dockerfile for Shashwat Group CRM Server
FROM node:20-alpine AS builder

WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./
COPY database/ ../database/
COPY cloud/ ../cloud/

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app ./
COPY --from=builder /database ../database
COPY --from=builder /cloud ../cloud

EXPOSE 5000

CMD ["node", "src/index.js"]
