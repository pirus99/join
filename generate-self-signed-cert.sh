#!/bin/bash
# Generate self-signed SSL certificate for local development/testing
# This script creates a self-signed certificate that can be used with Traefik
# before obtaining a real certificate from Let's Encrypt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Self-Signed Certificate Generator"
echo "================================================"
echo

# Default values
CERT_DIR="./certs"
DOMAIN="${1:-localhost}"
DAYS="${2:-365}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  Validity: $DAYS days"
echo "  Certificate directory: $CERT_DIR"
echo

# Create certificate directory
mkdir -p "$CERT_DIR"

# Generate private key
echo -e "${GREEN}Generating private key...${NC}"
openssl genrsa -out "$CERT_DIR/cert.key" 2048

# Generate certificate signing request
echo -e "${GREEN}Generating certificate signing request...${NC}"
openssl req -new -key "$CERT_DIR/cert.key" -out "$CERT_DIR/cert.csr" -subj "/CN=$DOMAIN"

# Generate self-signed certificate
echo -e "${GREEN}Generating self-signed certificate...${NC}"
openssl x509 -req -days "$DAYS" -in "$CERT_DIR/cert.csr" -signkey "$CERT_DIR/cert.key" -out "$CERT_DIR/cert.crt"

# Create combined PEM file (required by some applications)
cat "$CERT_DIR/cert.crt" "$CERT_DIR/cert.key" > "$CERT_DIR/cert.pem"

# Set appropriate permissions
chmod 600 "$CERT_DIR/cert.key"
chmod 644 "$CERT_DIR/cert.crt"
chmod 600 "$CERT_DIR/cert.pem"

echo
echo -e "${GREEN}✓ Self-signed certificate generated successfully!${NC}"
echo
echo "Files created:"
echo "  - $CERT_DIR/cert.key (private key)"
echo "  - $CERT_DIR/cert.crt (certificate)"
echo "  - $CERT_DIR/cert.pem (combined PEM)"
echo
echo -e "${YELLOW}Note: Self-signed certificates will show security warnings in browsers.${NC}"
echo "This is normal and expected. You can accept the warning to proceed."
echo
echo "To use these certificates with Traefik:"
echo "  1. Uncomment the file provider section in docker-compose.yml"
echo "  2. Set USE_SELF_SIGNED_CERT=true in your .env file"
echo "  3. Run: docker compose up -d"
echo
echo "To access your application with HTTPS:"
echo "  https://$DOMAIN"
echo
