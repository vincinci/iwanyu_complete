# Development Setup Guide

## Current Status
✅ **Frontend**: Running on http://localhost:5173  
⚠️ **Backend**: Not running (optional for UI testing)

## Quick Start (Frontend Only)

The application is now running in **demo mode** where you can:

- ✅ View the homepage with clean design
- ✅ See the new orange logo
- ✅ Navigate through pages (Products, Register, etc.)
- ✅ Test UI components and animations
- ⚠️ Backend features are disabled (login, cart, etc.)

## To Run Full Application (Frontend + Backend)

### Option 1: Local Backend Setup

1. **Open a new terminal** (keep current one running for frontend)

2. **Navigate to server directory:**
   ```bash
   cd server
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the backend:**
   ```bash
   npm run dev
   ```

5. **If you see database errors:**
   - The app requires a PostgreSQL database
   - You can use a local PostgreSQL or cloud service like Neon.tech
   - Update `DATABASE_URL` in `server/.env`

### Option 2: Deploy Backend to Cloud

1. **Deploy to Render.com:**
   - Create account at render.com
   - Connect GitHub repository
   - Deploy `/server` directory
   - Add environment variables

2. **Update Frontend:**
   - Update `VITE_API_URL` in `.env.production`
   - Redeploy to Vercel

## Current Console Output Explained

- ✅ **API Base URL logged**: Shows correct API endpoint
- ⚠️ **Connection refused**: Expected since backend isn't running
- ✅ **Demo mode activated**: App continues to work
- ❌ **Extension errors**: Harmless Chrome extension conflicts

## Next Steps

1. **For UI/Design work**: Continue as-is in demo mode
2. **For full features**: Set up backend using Option 1 or 2 above
3. **For production**: Deploy backend and update environment variables

The application is designed to work gracefully with or without the backend!
