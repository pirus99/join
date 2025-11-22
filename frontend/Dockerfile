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
# Replaces the default apiUrl value in GlobalConfig class
RUN sed -i "s|static apiUrl: string = '[^']*';|static apiUrl: string = '${API_URL}';|g" src/app/global-config.ts

# Build the application for production
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
# Angular 19+ uses the application builder which outputs to dist/join/browser
COPY --from=builder /app/dist/join/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
