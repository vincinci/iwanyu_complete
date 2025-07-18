# Quick Fix: Vercel Environment Variables

## Problem
You're seeing: `Environment Variable "VITE_API_URL" references Secret "vite_api_url", which does not exist.`

## Solution

### Step 1: Remove Environment Variables from vercel.json
✅ **Already Fixed** - The `vercel.json` file has been updated to remove the problematic `env` section.

### Step 2: Set Environment Variables in Vercel Dashboard

1. **Go to your Vercel project dashboard**
2. **Click "Settings" tab**
3. **Click "Environment Variables" in the sidebar**
4. **Add these variables manually:**

| Name | Value | Environments |
|------|-------|-------------|
| `VITE_API_URL` | `https://your-render-backend.onrender.com` | Production, Preview, Development |
| `VITE_APP_NAME` | `Iwanyu` | Production, Preview, Development |
| `VITE_FLUTTERWAVE_PUBLIC_KEY` | `your_flutterwave_public_key` | Production, Preview, Development |

### Step 3: Update API URL
Once your Render backend is deployed, update the `VITE_API_URL` value with your actual Render service URL.

### Step 4: Redeploy
After adding the environment variables, trigger a new deployment in Vercel.

## Notes

- **Don't use** the "Add from .env" button during initial setup
- **Set for all environments** (Production, Preview, Development)
- **Environment variables in Vercel** take precedence over local .env files
- **The @ syntax** in vercel.json is for secrets, not regular environment variables

## Test Your Setup

After deployment, check:
- Frontend loads without errors
- API calls work (check browser console)
- No environment variable errors in Vercel logs
