#!/bin/sh
set -e

# Replace API URL in the built JavaScript files
# This allows runtime configuration of the API URL
# We search for common development URL patterns and replace them
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
