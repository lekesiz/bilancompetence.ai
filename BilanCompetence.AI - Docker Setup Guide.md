# BilanCompetence.AI - Docker Setup Guide

This guide explains how to run BilanCompetence.AI locally using Docker Compose.

---

## Prerequisites

- **Docker:** Version 20.10 or higher
- **Docker Compose:** Version 2.0 or higher
- **pnpm:** Version 8.0 or higher (for local development)

### Install Docker

#### macOS
```bash
# Install Docker Desktop
brew install --cask docker
```

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Windows
Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/bilancompetence.ai.git
cd bilancompetence.ai
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.docker .env

# Edit .env and fill in your values
nano .env  # or use your preferred editor
```

**Minimum required variables:**
```bash
JWT_SECRET=your-random-secret-key
SENDGRID_API_KEY=your-sendgrid-key  # For email functionality
```

### 3. Start Services
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### 4. Access Applications

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/health
- **pgAdmin:** http://localhost:5050 (optional, see profiles)

---

## Docker Compose Services

### Core Services (Always Running)

#### 1. PostgreSQL Database
- **Container:** `bilancompetence-postgres`
- **Port:** 5432
- **User:** postgres (configurable via `DB_USER`)
- **Password:** postgres (configurable via `DB_PASSWORD`)
- **Database:** bilancompetence (configurable via `DB_NAME`)

**Connect to database:**
```bash
# Using psql
docker compose exec postgres psql -U postgres -d bilancompetence

# Using connection string
psql "postgresql://postgres:postgres@localhost:5432/bilancompetence"
```

#### 2. Redis Cache
- **Container:** `bilancompetence-redis`
- **Port:** 6379
- **Max Memory:** 256MB
- **Eviction Policy:** allkeys-lru

**Connect to Redis:**
```bash
docker compose exec redis redis-cli
```

#### 3. Backend API
- **Container:** `bilancompetence-backend`
- **Port:** 3001
- **Health Check:** http://localhost:3001/health
- **Hot Reload:** Enabled (via volume mount)

**View logs:**
```bash
docker compose logs -f backend
```

#### 4. Frontend Application
- **Container:** `bilancompetence-frontend`
- **Port:** 3000
- **Hot Reload:** Enabled (via volume mount)

**View logs:**
```bash
docker compose logs -f frontend
```

### Optional Services (Profiles)

#### pgAdmin (Database Management UI)
```bash
# Start with pgAdmin
docker compose --profile tools up -d

# Access pgAdmin at http://localhost:5050
# Email: admin@bilancompetence.local
# Password: admin
```

**Add PostgreSQL server in pgAdmin:**
1. Right-click "Servers" > Create > Server
2. General tab: Name = "BilanCompetence Local"
3. Connection tab:
   - Host: `postgres`
   - Port: `5432`
   - Database: `bilancompetence`
   - Username: `postgres`
   - Password: `postgres`

#### Nginx Reverse Proxy
```bash
# Start with Nginx (production-like setup)
docker compose --profile production up -d
```

---

## Common Commands

### Start/Stop Services
```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d backend

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Execute Commands in Containers
```bash
# Backend shell
docker compose exec backend sh

# Run migrations
docker compose exec backend pnpm run migrate

# Run tests
docker compose exec backend pnpm test

# Frontend shell
docker compose exec frontend sh
```

### Rebuild Services
```bash
# Rebuild all services
docker compose build

# Rebuild specific service
docker compose build backend

# Rebuild and restart
docker compose up -d --build
```

### Database Operations
```bash
# Access PostgreSQL
docker compose exec postgres psql -U postgres -d bilancompetence

# Backup database
docker compose exec postgres pg_dump -U postgres bilancompetence > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres bilancompetence < backup.sql

# Run migrations
docker compose exec backend pnpm run migrate
```

---

## Development Workflow

### 1. Start Development Environment
```bash
# Start all services
docker compose up -d

# Watch logs
docker compose logs -f backend frontend
```

### 2. Make Code Changes
- Edit files in `apps/backend/` or `apps/frontend/`
- Changes are automatically detected and hot-reloaded
- No need to restart containers

### 3. Run Tests
```bash
# Backend tests
docker compose exec backend pnpm test

# Frontend tests
docker compose exec frontend pnpm test

# E2E tests
docker compose exec backend pnpm test:e2e
```

### 4. Database Migrations
```bash
# Create new migration
docker compose exec backend pnpm run migrate:create migration_name

# Run migrations
docker compose exec backend pnpm run migrate

# Rollback migration
docker compose exec backend pnpm run migrate:rollback
```

### 5. Install Dependencies
```bash
# Backend dependencies
docker compose exec backend pnpm install package-name

# Frontend dependencies
docker compose exec frontend pnpm install package-name

# Rebuild after adding dependencies
docker compose up -d --build
```

---

## Troubleshooting

### Issue: Services won't start
```bash
# Check logs
docker compose logs

# Check Docker status
docker ps -a

# Restart Docker daemon (Linux)
sudo systemctl restart docker

# Restart Docker Desktop (macOS/Windows)
```

### Issue: Port already in use
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or change port in docker-compose.yml
```

### Issue: Database connection errors
```bash
# Check if PostgreSQL is healthy
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Issue: Hot reload not working
```bash
# Ensure volumes are mounted correctly
docker compose config

# Restart services
docker compose restart backend frontend

# Rebuild if needed
docker compose up -d --build
```

### Issue: Out of disk space
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove specific volume
docker volume rm bilancompetence_postgres_data
```

---

## Production Deployment

### Using Docker Compose in Production

**⚠️ Warning:** Docker Compose is primarily for development. For production, consider:
- **Railway:** Backend deployment (current setup)
- **Vercel:** Frontend deployment (current setup)
- **Neon:** Managed PostgreSQL (current setup)

### Production Checklist

If deploying with Docker Compose:

1. **Environment Variables**
   - [ ] Set strong `JWT_SECRET`
   - [ ] Configure production database URL
   - [ ] Set `NODE_ENV=production`
   - [ ] Configure CORS origins
   - [ ] Set up email service (SendGrid)
   - [ ] Configure external APIs

2. **Security**
   - [ ] Use secrets management (Docker Secrets, Vault)
   - [ ] Enable HTTPS (Nginx with SSL)
   - [ ] Set up firewall rules
   - [ ] Disable debug logging
   - [ ] Enable rate limiting

3. **Monitoring**
   - [ ] Configure Sentry for error tracking
   - [ ] Set up log aggregation
   - [ ] Configure health checks
   - [ ] Set up alerts

4. **Backups**
   - [ ] Configure automated database backups
   - [ ] Test restore procedures
   - [ ] Store backups off-site

---

## Environment Variables Reference

See `.env.docker` for complete list of environment variables.

### Critical Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Authentication
JWT_SECRET=your-secret-key

# Email
SENDGRID_API_KEY=your-key

# CORS
CORS_ORIGIN=https://your-domain.com
```

### Optional Variables
```bash
# AI Services
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key

# Job Recommendations
FRANCE_TRAVAIL_API_KEY=your-key

# Monitoring
SENTRY_DSN=your-dsn
```

---

## Docker Compose Profiles

### Default Profile
```bash
# Starts: postgres, redis, backend, frontend
docker compose up -d
```

### Tools Profile
```bash
# Adds: pgAdmin
docker compose --profile tools up -d
```

### Production Profile
```bash
# Adds: nginx reverse proxy
docker compose --profile production up -d
```

### All Profiles
```bash
# Start everything
docker compose --profile tools --profile production up -d
```

---

## Volumes

### Persistent Data
- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis persistence files
- `pgadmin_data`: pgAdmin configuration
- `backend_logs`: Backend application logs

### View Volumes
```bash
# List volumes
docker volume ls | grep bilancompetence

# Inspect volume
docker volume inspect bilancompetence_postgres_data

# Backup volume
docker run --rm -v bilancompetence_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

## Networks

### Default Network
- **Name:** `bilancompetence-network`
- **Driver:** bridge
- **Subnet:** Auto-assigned

### Inspect Network
```bash
# View network details
docker network inspect bilancompetence-network

# List connected containers
docker network inspect bilancompetence-network | jq '.[0].Containers'
```

---

## Performance Optimization

### Resource Limits
Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Build Cache
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker compose build

# Clear build cache
docker builder prune
```

---

## Support

### Documentation
- **Main README:** `/README.md`
- **API Docs:** `/API_DOCUMENTATION.md`
- **Runbook:** `/RUNBOOK.md`

### Getting Help
- **Issues:** https://github.com/your-org/bilancompetence.ai/issues
- **Email:** support@bilancompetence.ai

---

**Last Updated:** 2025-10-27  
**Version:** 1.0.0

