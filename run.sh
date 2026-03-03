#!/bin/bash

# Attachment Manager - Run Script
# This script starts the application on port 3000

echo "Starting Attachment Manager..."

# Kill any process using port 5000 or 3000
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 1

# Navigate to project directory
cd "/Users/abdulaziz/Downloads/Attachment-Manager 2"

# Install dependencies if needed
echo "Checking dependencies..."
npm install

# Run the development server on port 3000
echo "Starting server on port 3000..."
PORT=3000 npm run dev

