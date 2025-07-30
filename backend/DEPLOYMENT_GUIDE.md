# FUNDAmental Backend Deployment Guide

This guide will help you deploy the FUNDAmental backend with a PostgreSQL database.

## Quick Start (5 Steps)

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New" → "PostgreSQL"
3. Name: `fundamental-db`
4. Plan: Free
5. Region: Choose closest to your users
6. Click "Create Database"
7. **Copy the Internal Database URL** (looks like: `postgresql://user:password@host:port/database`)

### Step 2: Update Backend Service

1. In your existing backend service on Render:
2. Go to "Environment" tab
3. Add environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the database URL from Step 1
4. Go to "Settings" tab
5. Change "Start Command" to: `node server-with-db.js`
6. Click "Save Changes"

### Step 3: Deploy Database Schema

1. In your backend service, go to "Shell" tab
2. Run these commands:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   node setup-db.js
   ```

### Step 4: Test the Setup

1. Visit your backend URL: `https://your-backend-url.onrender.com/`
2. You should see: `{"message":"FUNDAmental Backend API is running!","status":"healthy"}`

### Step 5: Update Frontend URLs

The frontend is already updated to use the live backend URLs. Your app should now work with persistent data!

## Default Admin Account

After running `node setup-db.js`, you'll have a default admin account:
- **Email**: `admin@fundamental.com`
- **Password**: `admin123`

⚠️ **Change these credentials in production!**

## What's New

### ✅ Fixed Upload/Download
- All upload/download URLs now point to the live backend
- Proper FormData formatting for file uploads
- User ID included in upload requests

### ✅ Database Integration
- PostgreSQL database with Prisma ORM
- Persistent data storage (no more data loss on restart)
- Proper relationships between users, courses, assignments, etc.

### ✅ Production Ready
- Error handling and logging
- Graceful database connections
- Environment variable configuration

## Testing Your Setup

1. **Test Registration**: Create a new user account
2. **Test Login**: Login with the admin account
3. **Test File Upload**: Upload a document in Resources or Assignments
4. **Test File Download**: Download the uploaded file
5. **Test Course Creation**: Create a new course (as teacher)
6. **Test Notifications**: Check the notifications tab

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` format
- Ensure the database is running
- Verify environment variables are set

### Upload Issues
- Check file size limits
- Verify file types are supported
- Check network connectivity

### Deployment Issues
- Check Render logs for errors
- Verify all environment variables are set
- Ensure the start command is correct

## Next Steps

1. **Security**: Implement JWT authentication
2. **File Storage**: Move to cloud storage (AWS S3)
3. **Email**: Add email verification
4. **Monitoring**: Add logging and monitoring
5. **Backup**: Set up database backups

## Support

If you encounter issues:
1. Check the Render logs
2. Verify environment variables
3. Test database connection
4. Check the Prisma documentation

Your FUNDAmental app is now production-ready with persistent data storage! 🎉 