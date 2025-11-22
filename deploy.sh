#!/bin/bash
# Quick deployment script for Join application
# This script helps you deploy or update the Join application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Join Application - Docker Deployment"
echo "========================================"
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not available. Please install Docker Compose V2.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file from .env.example${NC}"
        echo
        echo -e "${YELLOW}IMPORTANT: Please edit .env and configure the following:${NC}"
        echo "  1. DJANGO_SECRET_KEY - Generate a strong secret key"
        echo "  2. DOMAIN - Set your domain name"
        echo "  3. API_URL - Set the API URL"
        echo
        echo "To generate a Django secret key, run:"
        echo "  python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
        echo
        read -p "Press Enter to continue after editing .env, or Ctrl+C to cancel..."
    else
        echo -e "${RED}Error: .env.example not found!${NC}"
        exit 1
    fi
fi

echo
echo "Deployment Options:"
echo "  1. Deploy (first time or clean deploy)"
echo "  2. Update (rebuild and redeploy with latest code)"
echo "  3. Stop all services"
echo "  4. View logs"
echo "  5. Create Django superuser"
echo

read -p "Select option (1-5): " option

case $option in
    1)
        echo
        echo "Starting deployment..."
        docker compose up -d --build
        echo
        echo -e "${GREEN}✓ Deployment complete!${NC}"
        echo
        echo "Application URLs:"
        echo "  Frontend: http://localhost"
        echo "  Backend API: http://localhost/api/"
        echo "  Django Admin: http://localhost/admin/"
        echo "  Static Files: http://localhost/static/"
        echo "  Traefik Dashboard: http://localhost:8080"
        echo
        echo "Next steps:"
        echo "  1. Create a Django superuser: ./deploy.sh (option 5)"
        echo "  2. Access the application at http://localhost"
        ;;
    2)
        echo
        echo "Updating application..."
        echo "Pulling latest code..."
        git pull || echo "Skipping git pull..."
        echo "Rebuilding containers..."
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        echo
        echo -e "${GREEN}✓ Update complete!${NC}"
        ;;
    3)
        echo
        echo "Stopping all services..."
        docker compose down
        echo
        echo -e "${GREEN}✓ All services stopped${NC}"
        ;;
    4)
        echo
        echo "Viewing logs (press Ctrl+C to exit)..."
        docker compose logs -f
        ;;
    5)
        echo
        echo "Creating Django superuser..."
        echo "First, running migrations..."
        docker exec -it join-backend python manage.py migrate
        echo
        docker exec -it join-backend python manage.py createsuperuser
        echo
        echo -e "${GREEN}✓ Superuser created${NC}"
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
