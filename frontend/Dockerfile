# Stage 1: Build the React app
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application files needed for the build
COPY src/ ./src/
COPY public/ ./public/
COPY postcss.config.js tailwind.config.js ./

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Configure Nginx for SPA routing (React Router)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Expose port 80 (standard for HTTP)
EXPOSE 80

# Nginx runs by default, no CMD needed