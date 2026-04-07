---
name: docker
description: Docker and Docker Compose best practices for containerizing applications
---

# Docker Skill

Containers make environments reproducible. Follow these practices to build images that are small, secure, and fast to build.

## Dockerfile Best Practices

**Use specific base image tags** — never `latest` in production:
```dockerfile
FROM node:20-alpine        # good: pinned major version, minimal base
FROM node:latest           # bad: breaks unexpectedly on updates
```

**Layer ordering — put things that change least at the top**:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Dependencies first (changes rarely)
COPY package*.json ./
RUN npm ci --only=production

# Source code last (changes often)
COPY . .

CMD ["node", "src/index.js"]
```

This way Docker reuses the cached `npm ci` layer unless `package.json` changes.

**Use `.dockerignore`** to keep images small:
```
node_modules
.git
.env
*.log
coverage
dist
```

**Run as non-root user**:
```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

**Multi-stage builds** for compiled languages or when you need build tools:
```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Stage 2: production (no dev deps, no source)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

## Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}   # from .env file
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Common Commands

```bash
# Build and start
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f app

# Shell into running container
docker compose exec app sh

# Stop and remove containers
docker compose down

# Remove containers + volumes (destructive!)
docker compose down -v

# Build image without cache
docker build --no-cache -t myapp .

# Check image layers and size
docker image inspect myapp
docker history myapp
```

## Rules

- Never put secrets in `ENV` inside Dockerfile — use runtime environment variables or secrets
- Don't expose unnecessary ports
- One process per container — don't run multiple services in one container
- Use health checks so orchestrators know when your app is actually ready
- Named volumes for persistent data, bind mounts for local development only
