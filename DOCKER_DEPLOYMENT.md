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
API_URL=https://localhost/
DJANGO_SECRET_KEY=your-generated-secret-key-here
DJANGO_DEBUG=False
```

**Important:** Generate a strong Django secret key for production:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 3. Start the Application

```bash
docker compose up -d
```

This command will:
- Build the backend and frontend Docker images
- Start Traefik reverse proxy
- Start the backend API server
- Start the frontend web server

### 4. Access the Application

The application uses a **single domain** for both frontend and backend:

- **Frontend Application:** https://localhost
- **Backend API:** https://localhost/api/
- **Django Admin:** https://localhost/admin/
- **Traefik Dashboard:** http://localhost:8080 (if enabled)

**Note:** Your browser will show a security warning because Traefik uses a default self-signed certificate. This is normal for local development. Click "Advanced" and "Proceed to localhost" to continue.

### 5. Create Django Superuser

You have two options for creating a Django superuser:

#### Option A: Automatic Creation (Recommended)

Set environment variables in your `.env` file before starting the containers:

```bash
# Add to .env file
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your-secure-password
```

When the backend container starts, it will automatically:
- Run database migrations
- Create the superuser (if it doesn't already exist)

Then start the application:

```bash
docker compose up -d
```

The superuser will be created automatically on first run.

#### Option B: Manual Creation

If you prefer to create the superuser manually or if you didn't set the environment variables:

```bash
docker exec -it join-backend python manage.py createsuperuser
```

Or use the helper script:

```bash
./deploy.sh
# Select option 5 - Create Django superuser
```

**Note:** The database migrations are now run automatically when the container starts, so you don't need to run them manually.

## 🔒 SSL/TLS Configuration

### Default Configuration (Development)

By default, Traefik provides a self-signed certificate for HTTPS. This is perfect for local development and testing.

- **Access the app at:** https://localhost
- **Browser Warning:** You'll see a security warning because the certificate is self-signed. This is expected and safe for development.
- **Connection:** Still encrypted with TLS, just not trusted by default certificate authorities.

**No additional setup required!** Just start the containers and access via HTTPS.

### Production Configuration (Let's Encrypt)

For production deployment with a real domain, use Let's Encrypt for free, trusted SSL certificates.

#### Prerequisites

1. A registered domain name
2. DNS records pointing to your server
3. Ports 80 and 443 open on your firewall
4. Valid email address for Let's Encrypt notifications

#### Configuration Steps

1. **Update .env file:**
   ```bash
   DOMAIN=yourdomain.com
   API_URL=https://yourdomain.com/
   DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com
   DJANGO_CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ACME_EMAIL=admin@yourdomain.com
   ```

2. **Enable Let's Encrypt in docker-compose.yml:**
   
   Uncomment these lines in the Traefik service:
   ```yaml
   - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
   - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
   - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
   ```
   
   And uncomment the certresolver lines for backend and frontend:
   ```yaml
   - "traefik.http.routers.backend-secure.tls.certresolver=letsencrypt"
   - "traefik.http.routers.frontend-secure.tls.certresolver=letsencrypt"
   ```

3. **Deploy:**
   ```bash
   docker compose up -d
   ```

Let's Encrypt will automatically obtain and renew certificates.

## 🔧 Configuration Details

### Single Domain Architecture

The application uses a **single domain** for both frontend and backend:

- **Frontend:** Handles all requests to the root path and static assets
- **Backend:** Handles requests to `/api/*` and `/admin/*` paths
- **Routing:** Managed by Traefik with path-based routing rules
- **Priority:** Backend routes have higher priority (100) to ensure API and admin paths are captured before frontend catch-all route (priority 1)

### Environment Variables

All configuration is done through environment variables in the `.env` file:

#### Domain Configuration
```bash
DOMAIN=localhost                    # Your domain name (used for both frontend and backend)
API_URL=https://localhost/          # Full API URL for frontend (set at build time)
```

**Note:** The `API_URL` is configured at build time and compiled into the Angular application. If you change it, you need to rebuild the frontend container:
```bash
docker compose build frontend
docker compose up -d
```

#### Django Backend
```bash
DJANGO_SECRET_KEY=...              # Django secret key (REQUIRED in production)
DJANGO_DEBUG=False                 # Debug mode (set to False in production)
DJANGO_ALLOWED_HOSTS=...           # Comma-separated list of allowed hosts
DJANGO_CSRF_TRUSTED_ORIGINS=...    # Comma-separated trusted origins (use https://)
DJANGO_CORS_ALLOWED_ORIGINS=...    # Comma-separated CORS origins (use https://)
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

3. **Enable Let's Encrypt in docker-compose.yml:**
   
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
   docker compose up -d
   ```

## 🔄 Managing the Deployment

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik
```

### Stop the Application

```bash
docker compose down
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

### Rebuild and Redeploy

When you make code changes, rebuild the images:

```bash
# Rebuild and restart (with no cache)
docker compose build --no-cache
docker compose up -d

# Or in one command
docker compose up -d --build --force-recreate
```

### Update to Latest Code

```bash
# Pull latest code
git pull

# Rebuild and redeploy
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 📊 Database Management

### Data Persistence

The application uses Docker volumes to persist database files permanently:

- **Volume Name:** `backend-data`
- **Mount Point:** `/app/data` (inside the container)
- **Database File:** `/app/data/db.sqlite3`

This means your data is preserved even when you:
- Stop and restart containers
- Update the application (`docker compose down && docker compose up -d`)
- Rebuild images

To list all volumes:
```bash
docker volume ls | grep backend-data
```

To inspect the volume:
```bash
docker volume inspect join_backend-data
```

**Warning:** Only remove the volume if you want to delete all data:
```bash
# This will permanently delete all database data!
docker compose down -v
```

### Backup Database

```bash
# SQLite (default)
docker cp join-backend:/app/data/db.sqlite3 ./backup-$(date +%Y%m%d).sqlite3
```

### Restore Database

```bash
docker cp ./backup.sqlite3 join-backend:/app/data/db.sqlite3
docker compose restart backend
```

### Run Migrations

**Note:** Migrations are now run automatically when the container starts. You only need to run them manually if:
- You're developing and adding new migrations
- You need to apply specific migrations

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
docker compose ps
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
docker compose logs --tail=100 backend
```

### Reset Everything

```bash
# Warning: This will delete all data!
docker compose down -v
docker compose up -d
```

### HTTPS/Certificate Issues

**Browser shows security warning:**
- This is expected with Traefik's default self-signed certificate
- The connection is still encrypted
- For local development: Click "Advanced" and proceed
- For production: Configure Let's Encrypt as described above

**API calls fail with CORS errors:**
- Check that `DJANGO_CORS_ALLOWED_ORIGINS` includes your domain with `https://`
- Check that `API_URL` is set correctly in `.env`
- Restart containers after changing environment variables

## 🔒 Security Considerations

1. **Always change `DJANGO_SECRET_KEY` in production**
2. **Set `DJANGO_DEBUG=False` in production**
3. **Use strong passwords for admin accounts**
4. **Use Let's Encrypt for production deployments** (not Traefik default certificate)
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
docker compose up -d --scale backend=3
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
