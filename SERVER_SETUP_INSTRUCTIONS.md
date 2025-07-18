# Iwanyu E-commerce Platform - Server Setup Instructions

## Issue: 500 Internal Server Error

The 500 error you're seeing is because the backend server is not running. Here's how to fix it:

## Step 1: Start the Backend Server

Open a terminal and run:
```bash
cd /Users/dushimiyimanadavy/iwanyu/server
npm run dev
```

This will start the backend server on port 3000.

## Step 2: Start the Frontend Server

Open another terminal and run:
```bash
cd /Users/dushimiyimanadavy/iwanyu
npm run dev
```

This will start the frontend server on port 5173.

## Step 3: Test Admin Functionality

1. Go to http://localhost:5173/debug-admin
2. Click "Create Admin User" to create an admin account
3. Go to http://localhost:5173/login
4. Login with:
   - Email: admin@iwanyu.com
   - Password: admin123
5. You'll be redirected to /admin with full admin dashboard

## Alternative: Register as Admin

1. Go to http://localhost:5173/register
2. Select "Admin" account type (testing only)
3. Fill in the form and register
4. You'll be redirected to the admin dashboard

## Admin Dashboard Features

Once logged in as admin, you can access:
- `/admin` - Main dashboard overview
- `/admin/users` - User management
- `/admin/vendors` - Vendor management and approvals
- `/admin/products` - Product moderation
- `/admin/analytics` - Platform analytics (simplified version)
- `/admin/orders` - Order management
- `/admin/settings` - Admin settings

## Troubleshooting

If you encounter any issues:

1. **Database Issues**: Run `cd server && npm run db:push` to sync the database
2. **Port Conflicts**: Check if ports 3000 (backend) and 5173 (frontend) are available
3. **Dependencies**: Run `npm install` in both root and server directories
4. **Environment Variables**: Make sure `.env` files are properly configured

## Environment Setup

Backend (.env in server folder):
```
DATABASE_URL="your_neon_database_url"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

Frontend (.env in root folder):
```
VITE_API_URL="http://localhost:3000"
```

## Admin Credentials (for testing)

- Email: admin@iwanyu.com
- Password: admin123

The admin dashboard is now fully functional with:
- User management and moderation
- Vendor application approvals
- Product moderation and flagging
- Platform analytics and insights
- Order management
- Complete admin oversight tools

All features are implemented with clean, minimal UI design using orange accents and are mobile-responsive.
