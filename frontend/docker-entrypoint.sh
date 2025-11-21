#!/bin/sh
set -e

# Replace API URL in the built JavaScript files
# This allows runtime configuration of the API URL
if [ -n "$API_URL" ]; then
    echo "Configuring API URL to: $API_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000/|$API_URL|g" {} \;
fi

# Execute the CMD
exec "$@"
