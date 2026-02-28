#!/bin/bash

# Deployment Script for Skill Record (السجل المهاري)
# Usage: ./deploy.sh

set -e

echo "=== Starting Deployment ==="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL is not set"
    echo "Please create .env file or set DATABASE_URL environment variable"
    exit 1
fi

# Check if SESSION_SECRET is set
if [ -z "$SESSION_SECRET" ]; then
    echo "Error: SESSION_SECRET is not set"
    echo "Please create .env file or set SESSION_SECRET environment variable"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Run database migrations (if needed)
echo "Checking database..."
# npm run db:push  # Uncomment if you need to push schema changes

# Start the application with PM2
echo "Starting application with PM2..."
pm2 stop skill-record 2>/dev/null || true
pm2 start npm --name "skill-record" -- start
pm2 save

echo "=== Deployment Complete ==="
echo "Application is running on port 5000"
pm2 status

