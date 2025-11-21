#!/bin/sh
set -e

# Runtime API URL Configuration
# This script replaces hardcoded API URLs in the built JavaScript files
# with the API_URL environment variable at container startup.
#
# NOTE: This is a simple approach suitable for basic deployments.
# For more complex scenarios, consider using Angular's environment files
# or a build-time configuration approach with multiple build artifacts.
#
# The script searches for common development URL patterns and replaces them.
# It handles multiple possible patterns to ensure robustness.

if [ -n "$API_URL" ]; then
    echo "Configuring API URL to: $API_URL"
    # Find and replace multiple possible development URL patterns
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i \
        -e "s|http://localhost:8000/|$API_URL|g" \
        -e "s|http://127.0.0.1:8000/|$API_URL|g" \
        {} \;
else
    echo "API_URL not set, using default from build"
fi

# Execute the CMD
exec "$@"
