# Deployment Guide for Iwanyu E-commerce Platform

This guide explains how to deploy the Iwanyu platform on Render (backend) and Vercel (frontend).

## Prerequisites

1. GitHub repository with your code
2. Render account (https://render.com)
3. Vercel account (https://vercel.com)
4. Neon database (already configured)

## Backend Deployment on Render

### Step 1: Connect Repository
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `iwanyu_complete` repository
5. Set the root directory to `server`

### Step 2: Configure Build Settings
- **Name**: `iwanyu-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `server`
- **Build Command**: `npm install && npx prisma generate && npx prisma db push`
- **Start Command**: `npm start`

### Step 3: Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
FRONTEND_URL=https://your-vercel-domain.vercel.app
PORT=10000
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your Render service URL (e.g., `https://iwanyu-backend.onrender.com`)

## Frontend Deployment on Vercel

### Step 1: Connect Repository
1. Go to Vercel Dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select the root directory (not server)

### Step 2: Configure Build Settings
- **Project Name**: `iwanyu-complete`
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Environment Variables
Add these environment variables in Vercel Dashboard (Settings → Environment Variables):

**Important**: Add these in the Vercel dashboard, not in vercel.json

```bash
VITE_API_URL=https://your-render-backend-url.onrender.com
VITE_APP_NAME=Iwanyu
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
```

**Note**: Make sure to set these for all environments (Production, Preview, Development) in Vercel.

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your Vercel domain (e.g., `https://iwanyu-complete.vercel.app`)

## Post-Deployment Configuration

### Update CORS Settings
1. Go back to Render backend settings
2. Update the `FRONTEND_URL` environment variable with your actual Vercel domain
3. Redeploy the backend service

### Test the Deployment
1. Visit your Vercel frontend URL
2. Test user registration and login
3. Check that API calls work correctly
4. Test vendor and admin dashboards

## Database Setup

Your Neon database should already be configured. If you need to run migrations:

1. In Render dashboard, go to your service
2. Go to "Shell" tab
3. Run: `npx prisma db push`

## Important Notes

1. **Free Tier Limitations**:
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down may take 30+ seconds
   - Consider upgrading for production use

2. **Environment Variables**:
   - Never commit real API keys to Git
   - Use Render/Vercel environment variable settings
   - Update FRONTEND_URL after getting your Vercel domain

3. **File Uploads**:
   - Configure Cloudinary for file storage in production
   - Update multer configuration for cloud storage

4. **Domain Configuration**:
   - Update CORS settings with your actual domains
   - Consider using custom domains for production

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update FRONTEND_URL in backend environment variables
2. **Database Connection**: Check DATABASE_URL format and permissions
3. **Build Failures**: Ensure all dependencies are in package.json
4. **API Timeouts**: Render free tier has cold starts

### Health Checks

- Backend health: `https://your-render-url.onrender.com/api/health`
- Frontend: Check browser console for API connection errors

## Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database migrations run
- [ ] File upload configured (Cloudinary)
- [ ] Payment keys configured (Flutterwave)
- [ ] Email service configured
- [ ] Health checks passing
- [ ] User flows tested (registration, login, checkout)

## Support

For deployment issues:
- Check Render build logs
- Check Vercel function logs
- Verify environment variables
- Test API endpoints directly
