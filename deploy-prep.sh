#!/bin/bash

# 🚀 Iwanyu Deployment Script
echo "🎯 Preparing Iwanyu for deployment..."

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Error: Must run from root project directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Build client for production
echo "🏗️ Building client..."
cd client && npm run build
cd ..

# Test server build
echo "🧪 Testing server..."
cd server && npm run build
cd ..

echo "✅ Ready for deployment!"
echo ""
echo "📝 Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy frontend to Vercel from /client directory"
echo "3. Deploy backend to Render from /server directory"
echo "4. Update environment variables on both platforms"
echo ""
echo "🌐 Deployment URLs:"
echo "Frontend: https://your-app.vercel.app"
echo "Backend: https://your-backend.onrender.com"
