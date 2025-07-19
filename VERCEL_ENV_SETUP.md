# Vercel Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/dashboard
- Select your `iwanyu-complete` project
- Go to Settings → Environment Variables

### 2. Add These Variables

#### Backend API Configuration
```
Name: VITE_API_URL
Value: https://your-backend-url.onrender.com
Environment: Production, Preview, Development
```

#### App Configuration
```
Name: VITE_APP_NAME
Value: Iwanyu
Environment: Production, Preview, Development
```

#### Payment Configuration (Optional)
```
Name: VITE_FLUTTERWAVE_PUBLIC_KEY
Value: FLWPUBK_TEST-your-public-key
Environment: Production, Preview, Development
```

## Backend Deployment Options

### Option 1: Deploy Backend to Render.com
1. Create account at https://render.com
2. Connect your GitHub repository
3. Create a new Web Service
4. Use the `/server` directory as root
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)

### Option 2: Deploy Backend to Railway.app
1. Create account at https://railway.app
2. Connect GitHub and select your repository
3. Deploy from the `/server` directory
4. Add environment variables

### Option 3: Use Vercel for Backend (if simple API)
1. Create separate Vercel project for `/server`
2. Configure as Node.js API
3. Add environment variables

## After Backend Deployment

1. Update `VITE_API_URL` in Vercel with your backend URL
2. Ensure CORS is configured to allow your Vercel domain
3. Test the connection

## Troubleshooting

If you see "Network Error" or API connection issues:

1. **Check Backend Status**: Visit your backend URL + `/health`
2. **Verify Environment Variables**: Ensure VITE_API_URL is set correctly
3. **CORS Configuration**: Backend must allow your Vercel domain
4. **SSL/HTTPS**: Ensure backend uses HTTPS in production
