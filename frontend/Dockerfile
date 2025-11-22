# Frontend Dockerfile - Multi-stage Production Build

# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

# Build argument for API URL (can be overridden at build time)
ARG API_URL=https://localhost/

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Update global-config.ts with the API_URL build argument
# First, verify the file exists and show its content for debugging
RUN cat src/app/global-config.ts && \
    # Replace the apiUrl value - matches any URL in single quotes after 'static apiUrl: string = '
    sed -i "s|static apiUrl: string = '[^']*'|static apiUrl: string = '${API_URL}'|g" src/app/global-config.ts && \
    # Verify the replacement was successful
    echo "Updated global-config.ts:" && cat src/app/global-config.ts

# Build the application for production using Angular CLI
RUN npx ng build && \
    echo "=== Build complete. Checking output structure ===" && \
    ls -la dist/ && \
    echo "=== Checking dist/join/ ===" && \
    ls -la dist/join/ && \
    echo "=== Checking for browser subdirectory ===" && \
    (ls -la dist/join/browser/ 2>/dev/null || echo "No browser subdirectory found") && \
    echo "=== Files directly in dist/join/ ===" && \
    find dist/join -maxdepth 1 -type f

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
# Angular 19+ application builder: try browser subdirectory first, then fall back to main directory
COPY --from=builder /app/dist/join /tmp/dist

# Copy files from the correct location to nginx html directory
RUN if [ -d /tmp/dist/browser ] && [ -f /tmp/dist/browser/index.html ]; then \
        echo "=== Copying from browser subdirectory ===" && \
        cp -r /tmp/dist/browser/* /usr/share/nginx/html/; \
    elif [ -f /tmp/dist/index.html ]; then \
        echo "=== Copying from main dist directory ===" && \
        cp -r /tmp/dist/* /usr/share/nginx/html/; \
    else \
        echo "ERROR: Could not find index.html" && \
        echo "Contents of /tmp/dist:" && ls -la /tmp/dist/ && \
        exit 1; \
    fi && \
    rm -rf /tmp/dist

# Verify files were copied correctly
RUN echo "=== Files in nginx html directory ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Checking for index.html ===" && \
    if [ -f /usr/share/nginx/html/index.html ]; then \
        echo "✓ index.html found" && \
        echo "First 20 lines:" && cat /usr/share/nginx/html/index.html | head -20; \
    else \
        echo "✗ ERROR: index.html NOT found" && exit 1; \
    fi

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
