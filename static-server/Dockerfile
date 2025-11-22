# Static Server Dockerfile - Serves Django admin and DRF static files
FROM nginx:alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directory for static files
RUN mkdir -p /usr/share/nginx/html/static

# The static files will be copied from the backend build stage
# This is done in docker-compose.yml using a shared volume

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
