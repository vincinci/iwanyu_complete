#!/bin/bash

echo "🚀 Starting Iwanyu Backend Server..."
echo "📍 Current directory: $(pwd)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the server directory."
    exit 1
fi

echo "📦 Installing dependencies if needed..."
npm install

echo "🔧 Starting development server..."
npm run dev
