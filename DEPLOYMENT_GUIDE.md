# 🚀 Deployment Guide: Vercel (Frontend) + Render (Backend)

## 📋 Overview

This guide will help you deploy the Iwanyu e-commerce platform:
- **Frontend (Client)**: Deploy to Vercel
- **Backend (Server)**: Deploy to Render
- **Database**: Already on Neon.tech

---

## 🎨 PART 1: Deploy Frontend to Vercel

### Step 1: Prepare Your Repository
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**

### Step 3: Import Your Repository
1. Select your `iwanyu` repository
2. Vercel will detect it as a monorepo
3. Configure the project:

**Framework Preset**: `Other`
**Root Directory**: `client`
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### Step 4: Environment Variables (Vercel)
Add these environment variables in Vercel dashboard:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_FLUTTERWAVE_PUBLIC_KEY=d97f499e-85c4-4755-a086-7d0dfb95aa33
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Your frontend will be live at: `https://your-app.vercel.app`

---

## ⚙️ PART 2: Deploy Backend to Render

### Step 1: Prepare Backend for Render
Create a `render.yaml` in your server directory:

```yaml
services:
  - type: web
    name: iwanyu-backend
    env: node
    plan: free
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: FLUTTERWAVE_SECRET_KEY
        sync: false
      - key: FLUTTERWAVE_PUBLIC_KEY
        sync: false
      - key: FLUTTERWAVE_ENCRYPTION_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
```

### Step 2: Login to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click **"New +"** → **"Web Service"**

### Step 3: Connect Repository
1. Select your `iwanyu` repository
2. Configure the service:

**Name**: `iwanyu-backend`
**Root Directory**: `server`
**Environment**: `Node`
**Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
**Start Command**: `npm start`

### Step 4: Environment Variables (Render)
Add these in Render dashboard → Environment:

```env
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_Lj3RvKqQx2AM@ep-weathered-sunset-a8anqoat-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=iwanyu-jwt-secret-key-super-secure-production-ready-2024
JWT_EXPIRES_IN=7d
FLUTTERWAVE_SECRET_KEY=8eNYcV7ptrlFQWGUD2TePGJVo0rheyIq
FLUTTERWAVE_PUBLIC_KEY=d97f499e-85c4-4755-a086-7d0dfb95aa33
FLUTTERWAVE_ENCRYPTION_KEY=TPYdw3BQA0kL8eiXsla63/bfD1Z3le+48/agly36VPQ=
CLOUDINARY_CLOUD_NAME=iwanyu-cloud
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
PORT=10000
FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 5: Deploy Backend
1. Click **"Create Web Service"**
2. Wait for build and deployment
3. Your backend will be live at: `https://your-backend.onrender.com`

---

## 🔄 PART 3: Connect Frontend to Backend

### Step 1: Update Frontend Environment
In Vercel dashboard, update the environment variable:
```env
VITE_API_URL=https://your-actual-backend-url.onrender.com
```

### Step 2: Update Backend CORS
In your server, make sure CORS allows your Vercel domain:
```javascript
// In server/src/server.js
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### Step 3: Redeploy
1. Push changes to GitHub
2. Both Vercel and Render will auto-deploy
3. Test the connection

---

## 🧪 PART 4: Testing Deployment

### Test Checklist:
- [ ] Frontend loads without errors
- [ ] Backend API responds (check `/api/health`)
- [ ] Database connection works
- [ ] User registration works
- [ ] Login functionality works
- [ ] Real-time chat connects
- [ ] Payment integration works

### Common Issues & Solutions:

**Frontend not loading**: Check build logs in Vercel
**API not connecting**: Verify CORS and API URL
**Database errors**: Check DATABASE_URL and migration status
**Environment variables**: Ensure all secrets are set correctly

---

## 📱 PART 5: Custom Domain (Optional)

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records

### For Render:
1. Go to Service Settings → Custom Domains
2. Add your API domain
3. Configure DNS records

---

## 🎯 Final URLs

After successful deployment:
- **Frontend**: `https://iwanyu.vercel.app`
- **Backend**: `https://iwanyu-backend.onrender.com`
- **Admin Panel**: `https://iwanyu.vercel.app/admin`

Your Iwanyu e-commerce platform is now live! 🎉
