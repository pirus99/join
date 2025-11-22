# Docker Production Deployment - Quick Reference

## 🚀 Quick Start Commands

### Initial Deployment with HTTPS

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env with your settings (HTTPS is enabled by default)
# OPTIONAL: Set DJANGO_SUPERUSER_* variables for automatic admin creation

# 2. Deploy (migrations and superuser creation happen automatically)
docker compose up -d --build
```

**Note:** 
- Traefik provides a default self-signed certificate (browser will show security warning)
- Database migrations and superuser creation (if configured) happen automatically on first container start

### Using the Helper Script
```bash
./deploy.sh
# Choose option 1 for initial deployment
# Choose option 5 to create superuser
```

## 📍 Access Points

After deployment, the application uses a **single domain** for both frontend and backend:

- **Frontend**: https://localhost
- **Backend API**: https://localhost/api/
- **Django Admin**: https://localhost/admin/
- **Static Files**: https://localhost/static/ (Django admin and DRF assets)
- **Traefik Dashboard**: http://localhost:8080 (if enabled)

**Note:** Browser will show a security warning for Traefik's default self-signed certificate. Click "Advanced" and proceed.

## 🔒 SSL/TLS Quick Setup

### Default (Development)

Traefik automatically provides a self-signed certificate - **no setup required!**

```bash
# Just deploy and access via HTTPS
docker compose up -d
```

### Let's Encrypt (Production)

```bash
# 1. Update .env:
#    DOMAIN=yourdomain.com
#    API_URL=https://yourdomain.com/
#    ACME_EMAIL=admin@yourdomain.com

# 2. Uncomment Let's Encrypt lines in docker-compose.yml
# 3. Deploy
docker compose up -d
```

## 🔄 Update Deployment

To update with latest code changes:

```bash
# Method 1: Using helper script
./deploy.sh
# Choose option 2

# Method 2: Manual commands
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 🔧 Common Operations

### View Logs
```bash
docker compose logs -f             # All services
docker compose logs -f backend     # Backend only
docker compose logs -f frontend    # Frontend only
```

### Stop/Start Services
```bash
docker compose down               # Stop all
docker compose up -d             # Start all
docker compose restart backend   # Restart backend
```

### Database Operations
```bash
# Run migrations (usually automatic on container start)
docker exec -it join-backend python manage.py migrate

# Create superuser (automatic if DJANGO_SUPERUSER_* env vars are set)
docker exec -it join-backend python manage.py createsuperuser

# Access Django shell
docker exec -it join-backend python manage.py shell

# Backup database (SQLite)
docker cp join-backend:/app/data/db.sqlite3 ./backup.sqlite3

# Check database volume
docker volume inspect join_backend-data
```

**Automatic Superuser Creation:**
Add these to your `.env` file before first deployment:
```bash
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your-secure-password
```

## 🌐 Production Deployment

### Prerequisites
1. Domain name pointing to your server
2. Open ports 80 and 443 on your firewall
3. Valid email for Let's Encrypt

### Configuration Steps

1. **Update .env file:**
```bash
DOMAIN=yourdomain.com
API_URL=https://yourdomain.com/
DJANGO_SECRET_KEY=<generate-strong-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com
DJANGO_CORS_ALLOWED_ORIGINS=https://yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Automatic admin user creation (recommended for first deployment)
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
DJANGO_SUPERUSER_PASSWORD=<strong-password>
```

2. **Enable SSL in docker-compose.yml:**
   - Uncomment Let's Encrypt configuration in Traefik section
   - Uncomment certresolver lines for backend and frontend

3. **Deploy:**
```bash
docker compose up -d --build
```

## 🔒 Security Checklist

- [ ] Changed DJANGO_SECRET_KEY to a strong random value
- [ ] Set DJANGO_DEBUG=False in production
- [ ] Configured proper DOMAIN and allowed hosts
- [ ] Enabled SSL/TLS with Let's Encrypt (for production)
- [ ] Secured or disabled Traefik dashboard
- [ ] Created strong admin password
- [ ] Configured firewall (allow 80, 443)
- [ ] Set up regular database backups
- [ ] Review and update CORS settings

## 🐛 Troubleshooting

### Container won't start
```bash
docker compose ps                    # Check status
docker compose logs backend         # Check logs
```

### Database issues
```bash
docker exec -it join-backend ls -la /app/data/
docker exec -it join-backend python manage.py showmigrations

# Check if database volume exists and has data
docker volume inspect join_backend-data
docker run --rm -v join_backend-data:/data alpine ls -la /data
```

### Frontend can't reach backend
1. Check API_URL in .env is `https://localhost/` (or your domain)
2. Verify backend is accessible at `/api`, `/admin`, and `/static` paths
3. Check CORS settings in Django allow your frontend domain
4. Check Traefik routing: `docker compose logs traefik`

### SSL certificate issues
```bash
docker compose logs traefik
# For production with Let's Encrypt:
# - Check ACME email is correct
# - Verify DNS points to your server
# - Ensure ports 80 and 443 are open
```

## 📊 Monitoring

### Check service health
```bash
docker compose ps
docker inspect join-backend --format='{{.State.Health.Status}}'
docker inspect join-frontend --format='{{.State.Health.Status}}'
```

### Resource usage
```bash
docker stats
```

## 🔄 Backup and Restore

### Backup
```bash
# Database
docker cp join-backend:/app/data/db.sqlite3 ./backups/db-$(date +%Y%m%d).sqlite3

# All persistent data
docker run --rm -v join_backend-data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/backend-data-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore
```bash
# Database
docker cp ./backups/db-backup.sqlite3 join-backend:/app/data/db.sqlite3
docker compose restart backend
```

## 📚 Additional Resources

- Full deployment guide: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- Development setup: [README.md](./README.md)
- Django documentation: https://docs.djangoproject.com/
- Traefik documentation: https://doc.traefik.io/traefik/
- Docker documentation: https://docs.docker.com/

## 💡 Tips

1. **Single Domain Architecture**: Both frontend and backend use the same domain - backend at `/api`, `/admin`, and `/static` paths
2. **Use PostgreSQL in Production**: SQLite is fine for development but use PostgreSQL for production
3. **Regular Backups**: Set up automated daily backups (database is persisted in Docker volume `backend-data`)
4. **Monitor Logs**: Regularly check logs for errors or suspicious activity
5. **Update Images**: Periodically rebuild with latest base images for security patches
6. **Test Before Deploy**: Test changes in a staging environment first
7. **Automatic Superuser**: Use environment variables for initial superuser creation
8. **Data Persistence**: Database is stored in a Docker volume and persists across container restarts

## 🆘 Getting Help

If you encounter issues:
1. Check logs: `docker compose logs`
2. Verify configuration: `docker compose config`
3. Review health status: `docker compose ps`
4. Check environment variables: `docker compose config | grep -A 20 environment`
5. Open an issue on GitHub with logs and configuration details

---

For detailed information, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
