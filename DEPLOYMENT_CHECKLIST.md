# Deployment Checklist

## Before Deployment

### Backend Preparation
- [ ] Environment variables configured in `.env`
- [ ] Database URL updated for production
- [ ] JWT secret generated (32+ characters)
- [ ] Flutterwave keys configured
- [ ] Cloudinary credentials set
- [ ] Email service configured
- [ ] CORS origins updated for production
- [ ] Health check endpoint working

### Frontend Preparation
- [ ] API URL updated for production
- [ ] Environment variables configured
- [ ] Build process working locally
- [ ] All routes tested
- [ ] Mobile responsiveness verified

## Render Backend Deployment

### Setup
- [ ] Repository connected to Render
- [ ] Root directory set to `server`
- [ ] Build command: `npm install && npx prisma generate && npx prisma db push`
- [ ] Start command: `npm start`
- [ ] Environment variables added
- [ ] Health check path: `/api/health`

### Environment Variables (Render)
```
NODE_ENV=production
DATABASE_URL=your_neon_db_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FLUTTERWAVE_SECRET_KEY=your_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_public_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://your-vercel-domain.vercel.app
PORT=10000
```

## Vercel Frontend Deployment

### Setup
- [ ] Repository connected to Vercel
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added

### Environment Variables (Vercel)
```
VITE_API_URL=https://your-render-backend.onrender.com
VITE_APP_NAME=Iwanyu
VITE_FLUTTERWAVE_PUBLIC_KEY=your_public_key
```

## Post-Deployment

### Testing
- [ ] Frontend loads correctly
- [ ] Backend health check responds
- [ ] User registration works
- [ ] User login works
- [ ] API calls successful
- [ ] File uploads working
- [ ] Payment integration tested
- [ ] Vendor dashboard accessible
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness verified

### Performance
- [ ] API response times acceptable
- [ ] Frontend load times good
- [ ] Images loading properly
- [ ] No console errors

### Security
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Environment variables secure
- [ ] API endpoints protected
- [ ] File upload validation working

## Troubleshooting

### Common Issues
- [ ] CORS errors → Update FRONTEND_URL
- [ ] Database connection → Check DATABASE_URL
- [ ] Build failures → Check dependencies
- [ ] API timeouts → Render cold starts
- [ ] 404 errors → Check Vercel routing

### Debug Steps
1. Check Render build logs
2. Check Vercel function logs
3. Test API endpoints directly
4. Verify environment variables
5. Check browser console for errors

## Production Monitoring

### Health Checks
- [ ] Backend: `https://your-backend.onrender.com/api/health`
- [ ] Frontend: Load main page and check console
- [ ] Database: Test user registration/login

### Performance Monitoring
- [ ] Monitor API response times
- [ ] Check error rates
- [ ] Monitor uptime
- [ ] Track user experience

## Maintenance

### Regular Tasks
- [ ] Monitor server logs
- [ ] Check database performance
- [ ] Update dependencies
- [ ] Backup database
- [ ] Review security settings

### Scaling Considerations
- [ ] Monitor resource usage
- [ ] Consider upgrading Render plan
- [ ] Optimize database queries
- [ ] Implement caching
- [ ] CDN for static assets
