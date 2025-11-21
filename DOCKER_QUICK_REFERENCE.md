# Docker Production Deployment - Quick Reference

## 🚀 Quick Start Commands

### Initial Deployment
```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# 2. Deploy
docker compose up -d --build

# 3. Initialize database and create admin user
docker exec -it join-backend python manage.py migrate
docker exec -it join-backend python manage.py createsuperuser
```

### Using the Helper Script
```bash
./deploy.sh
# Choose option 1 for initial deployment
# Choose option 5 to create superuser
```

## 📍 Access Points

After deployment, access:
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/
- **Django Admin**: http://localhost/admin/
- **Traefik Dashboard**: http://localhost:8080 (if enabled)

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
# Run migrations
docker exec -it join-backend python manage.py migrate

# Create superuser
docker exec -it join-backend python manage.py createsuperuser

# Access Django shell
docker exec -it join-backend python manage.py shell

# Backup database (SQLite)
docker cp join-backend:/app/data/db.sqlite3 ./backup.sqlite3
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
```

2. **Enable SSL in docker-compose.yml:**
   - Uncomment Let's Encrypt configuration in Traefik section
   - Uncomment HTTPS routers for backend and frontend

3. **Deploy:**
```bash
docker compose up -d --build
```

## 🔒 Security Checklist

- [ ] Changed DJANGO_SECRET_KEY to a strong random value
- [ ] Set DJANGO_DEBUG=False in production
- [ ] Configured proper DOMAIN and allowed hosts
- [ ] Enabled SSL/TLS with Let's Encrypt
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
```

### Frontend can't reach backend
1. Check API_URL in .env matches your setup
2. Verify CORS settings in Django allow your frontend domain
3. Check Traefik routing in docker compose logs

### SSL certificate issues
```bash
docker compose logs traefik
# Check ACME email is correct
# Verify DNS points to your server
# Ensure ports 80 and 443 are open
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

1. **Use PostgreSQL in Production**: SQLite is fine for development but use PostgreSQL for production
2. **Regular Backups**: Set up automated daily backups
3. **Monitor Logs**: Regularly check logs for errors or suspicious activity
4. **Update Images**: Periodically rebuild with latest base images for security patches
5. **Test Before Deploy**: Test changes in a staging environment first

## 🆘 Getting Help

If you encounter issues:
1. Check logs: `docker compose logs`
2. Verify configuration: `docker compose config`
3. Review health status: `docker compose ps`
4. Check environment variables: `docker compose config | grep -A 20 environment`
5. Open an issue on GitHub with logs and configuration details

---

For detailed information, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
