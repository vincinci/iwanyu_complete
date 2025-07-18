#!/bin/bash

echo "Starting Iwanyu Backend Server..."

# Navigate to server directory
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Starting server on port 3001..."
npm run dev
