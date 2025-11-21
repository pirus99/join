# Docker Production Deployment Guide

This guide explains how to deploy the Join application using Docker with Traefik as a reverse proxy.

## 📋 Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose V2 (included with Docker Desktop or install separately)
- A domain name (optional, for production with SSL)
- Basic knowledge of Docker and networking

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/pirus99/join.git
cd join
```

### 2. Configure Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your preferred text editor and update the following key variables:

```bash
# Basic configuration for local testing
DOMAIN=localhost
API_URL=http://localhost/
DJANGO_SECRET_KEY=your-generated-secret-key-here
DJANGO_DEBUG=False
```

**Important:** Generate a strong Django secret key for production:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 3. Start the Application

```bash
docker-compose up -d
```

This command will:
- Build the backend and frontend Docker images
- Start Traefik reverse proxy
- Start the backend API server
- Start the frontend web server

### 4. Access the Application

- **Frontend Application:** http://localhost
- **Backend API:** http://localhost/api/
- **Django Admin:** http://localhost/admin/
- **Traefik Dashboard:** http://localhost:8080 (if enabled)

### 5. Create Django Superuser (First Time Only)

```bash
docker exec -it join-backend python manage.py migrate
docker exec -it join-backend python manage.py createsuperuser
```

## 🔧 Configuration Details

### Environment Variables

All configuration is done through environment variables in the `.env` file:

#### Domain Configuration
```bash
DOMAIN=localhost                    # Your domain name
API_URL=http://localhost/          # Full API URL for frontend
```

#### Django Backend
```bash
DJANGO_SECRET_KEY=...              # Django secret key (REQUIRED in production)
DJANGO_DEBUG=False                 # Debug mode (set to False in production)
DJANGO_ALLOWED_HOSTS=...           # Comma-separated list of allowed hosts
DJANGO_CSRF_TRUSTED_ORIGINS=...    # Comma-separated trusted origins
DJANGO_CORS_ALLOWED_ORIGINS=...    # Comma-separated CORS origins
```

#### Traefik Configuration
```bash
TRAEFIK_HTTP_PORT=80               # HTTP port
TRAEFIK_HTTPS_PORT=443             # HTTPS port
TRAEFIK_DASHBOARD_PORT=8080        # Dashboard port
TRAEFIK_LOG_LEVEL=INFO             # Log level (DEBUG, INFO, WARN, ERROR)
```

### Production Deployment

For production deployment with a real domain and SSL:

1. **Update Domain Configuration:**
   ```bash
   DOMAIN=yourdomain.com
   API_URL=https://yourdomain.com/
   ```

2. **Configure Django Settings:**
   ```bash
   DJANGO_SECRET_KEY=your-strong-secret-key
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com
   DJANGO_CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Enable SSL in docker-compose.yml:**
   
   Uncomment the SSL/HTTPS sections in `docker-compose.yml`:
   - Traefik Let's Encrypt configuration
   - Backend and Frontend HTTPS routers
   
   Update these lines:
   ```yaml
   - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
   - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
   - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
   ```

4. **Set ACME Email in .env:**
   ```bash
   ACME_EMAIL=admin@yourdomain.com
   ```

5. **Point DNS to your server:**
   - Create A record: `yourdomain.com` → Your server IP
   - Create A record: `www.yourdomain.com` → Your server IP

6. **Deploy:**
   ```bash
   docker-compose up -d
   ```

## 🔄 Managing the Deployment

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f traefik
```

### Stop the Application

```bash
docker-compose down
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild and Redeploy

When you make code changes, rebuild the images:

```bash
# Rebuild and restart (with no cache)
docker-compose build --no-cache
docker-compose up -d

# Or in one command
docker-compose up -d --build --force-recreate
```

### Update to Latest Code

```bash
# Pull latest code
git pull

# Rebuild and redeploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Database Management

### Backup Database

```bash
# SQLite (default)
docker cp join-backend:/app/data/db.sqlite3 ./backup-$(date +%Y%m%d).sqlite3
```

### Restore Database

```bash
docker cp ./backup.sqlite3 join-backend:/app/data/db.sqlite3
docker-compose restart backend
```

### Run Migrations

```bash
docker exec -it join-backend python manage.py migrate
```

### Access Django Shell

```bash
docker exec -it join-backend python manage.py shell
```

## 🐛 Troubleshooting

### Check Container Status

```bash
docker-compose ps
```

### Check Container Health

```bash
docker ps
```

### Access Container Shell

```bash
# Backend
docker exec -it join-backend /bin/sh

# Frontend
docker exec -it join-frontend /bin/sh
```

### View Specific Service Logs

```bash
docker-compose logs --tail=100 backend
```

### Reset Everything

```bash
# Warning: This will delete all data!
docker-compose down -v
docker-compose up -d
```

## 🔒 Security Considerations

1. **Always change `DJANGO_SECRET_KEY` in production**
2. **Set `DJANGO_DEBUG=False` in production**
3. **Use strong passwords for admin accounts**
4. **Enable SSL/TLS for production deployments**
5. **Secure or disable Traefik dashboard in production**
6. **Regularly update Docker images for security patches**
7. **Use PostgreSQL or MySQL instead of SQLite for production**
8. **Implement proper backup strategies**
9. **Use environment-specific configuration files**
10. **Monitor logs for suspicious activity**

## 📈 Performance Optimization

### Use PostgreSQL for Production

Update `.env`:
```bash
DB_ENGINE=django.db.backends.postgresql
DB_NAME=join_db
DB_USER=join_user
DB_PASSWORD=strong_password
DB_HOST=postgres
DB_PORT=5432
```

Add PostgreSQL service to `docker-compose.yml`:
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: ${DB_NAME}
    POSTGRES_USER: ${DB_USER}
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - postgres-data:/var/lib/postgresql/data
  networks:
    - web
```

Don't forget to add `postgres-data:` to volumes section.

### Scale Backend Workers

```bash
docker-compose up -d --scale backend=3
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)

## 🤝 Support

For issues and questions, please open an issue on GitHub.

## 📝 License

This project is for educational purposes.
