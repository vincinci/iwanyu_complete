# Registration Troubleshooting Guide

## Prerequisites
1. Make sure you have Node.js installed
2. Make sure PostgreSQL database is accessible (Neon.tech)

## Steps to Test Registration

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```

The server should start on port 3001. You should see:
```
Server running on port 3001
Environment: development
```

### 2. Test Server Connection
Visit: http://localhost:3001/health
You should see: `{"status":"OK","timestamp":"..."}`

### 3. Start Frontend
```bash
# In the main project directory
npm run dev
```

### 4. Test Registration
1. Visit: http://localhost:5174/register
2. Fill in the form with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: +250123456789
   - Password: password123
   - Account Type: Customer or Vendor
   - Check the terms checkbox
3. Click "Create Account"

### 5. Debug Registration Issues
Visit: http://localhost:5174/debug

This page has buttons to:
- Test server connection
- Test registration endpoint directly

## Common Issues

### Server Connection Refused
- Make sure the backend server is running
- Check if port 3001 is available
- Verify environment variables in `server/.env`

### Database Issues
- Check DATABASE_URL in `server/.env`
- Run: `cd server && npx prisma generate`
- Run: `cd server && npx prisma db push`

### CORS Issues
- Make sure FRONTEND_URL in `server/.env` matches your frontend URL
- Default should be: `http://localhost:5173` or `http://localhost:5174`

## Environment Variables

### Frontend (/.env)
```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Iwanyu
VITE_FLUTTERWAVE_PUBLIC_KEY=your-key
```

### Backend (/server/.env)
```
DATABASE_URL="your-neon-db-url"
JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:5173"
PORT=3001
```

## Registration Data Format
The registration sends this data to `/api/auth/register`:
```json
{
  "firstName": "Test",
  "lastName": "User", 
  "email": "test@example.com",
  "phone": "+250123456789",
  "password": "password123",
  "role": "CUSTOMER" // or "VENDOR"
}
```
