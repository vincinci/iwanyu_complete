#!/bin/bash

# Production Build Script for Iwanyu Platform
echo "🚀 Building Iwanyu for production deployment..."

# Frontend build
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# Backend setup
echo "🔧 Setting up backend..."
cd server

# Install dependencies
echo "📥 Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed!"
else
    echo "❌ Backend dependency installation failed!"
    exit 1
fi

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated!"
else
    echo "❌ Prisma client generation failed!"
    exit 1
fi

echo "🎉 Production build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render"
echo "2. Deploy frontend to Vercel"
echo "3. Update environment variables"
echo "4. Test the deployment"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
