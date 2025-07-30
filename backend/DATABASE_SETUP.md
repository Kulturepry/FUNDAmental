# FUNDAmental Database Setup Guide

This guide will help you set up a PostgreSQL database for the FUNDAmental app using Prisma ORM.

## Prerequisites

1. **PostgreSQL Database** (you can use Render, Railway, or any PostgreSQL provider)
2. **Node.js** (version 16 or higher)
3. **npm** or **yarn**

## Step 1: Set Up PostgreSQL Database

### Option A: Using Render.com (Recommended - Free Tier)

1. Go to [Render.com](https://render.com) and create an account
2. Click "New" → "PostgreSQL"
3. Choose a name (e.g., "fundamental-db")
4. Select "Free" plan
5. Choose a region close to your users
6. Click "Create Database"
7. Once created, copy the **Internal Database URL** (it looks like: `postgresql://user:password@host:port/database`)

### Option B: Using Railway.app

1. Go to [Railway.app](https://railway.app) and create an account
2. Click "New Project" → "Provision PostgreSQL"
3. Once created, go to the database service
4. Copy the **Postgres Connection URL**

### Option C: Using Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database: `createdb fundamental`
3. Your connection string will be: `postgresql://username:password@localhost:5432/fundamental`

## Step 2: Configure Environment Variables

1. In your Render/Railway backend service, add this environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string from Step 1

2. For local development, create a `.env` file in the `backend` folder:
   ```
   DATABASE_URL="your_postgresql_connection_string_here"
   PORT=3001
   NODE_ENV=development
   ```

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

## Step 4: Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate
```

## Step 5: Initialize Database with Sample Data

```bash
# Run the setup script to create default admin user and sample data
npm run db:setup
```

This will create:
- Default admin user (email: `admin@fundamental.com`, password: `admin123`)
- Sample courses
- Sample notifications

## Step 6: Deploy Backend with Database

### For Render.com:

1. Update your backend service to use the new server file:
   - Change the **Start Command** to: `node server-with-db.js`
   - Or rename `server-with-db.js` to `server.js`

2. Add the `DATABASE_URL` environment variable in your backend service settings

3. Deploy the service

### For Railway.app:

1. Add the `DATABASE_URL` environment variable
2. Update the start command if needed
3. Deploy

## Step 7: Test the Setup

1. Visit your backend URL: `https://your-backend-url.onrender.com/`
2. You should see: `{"message":"FUNDAmental Backend API is running!","status":"healthy"}`

3. Test registration: `POST /api/auth/register`
4. Test login with admin: `POST /api/auth/login` with admin credentials

## Database Schema Overview

The database includes these main tables:

- **users** - User accounts and profiles
- **courses** - Educational courses
- **course_enrollments** - Student enrollments in courses
- **assignments** - Course assignments and files
- **resources** - Educational resources and files
- **notifications** - User notifications
- **comments** - Comments on resources/assignments
- **community_posts** - Community forum posts
- **chat_messages** - Course chat messages

## Useful Commands

```bash
# View database in browser (Prisma Studio)
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Reset database (⚠️ DESTROYS ALL DATA)
npx prisma db push --force-reset
```

## Troubleshooting

### Common Issues:

1. **Connection Error**: Check your `DATABASE_URL` format
2. **Permission Error**: Ensure your database user has proper permissions
3. **Schema Error**: Run `npm run db:generate` after schema changes
4. **Migration Error**: Use `npm run db:push` instead of migrations for quick setup

### Reset Database:

```bash
# Reset everything and start fresh
npx prisma db push --force-reset
npm run db:setup
```

## Security Notes

⚠️ **Important Security Reminders:**

1. Change the default admin password in production
2. Use environment variables for sensitive data
3. Enable SSL for database connections in production
4. Regularly backup your database
5. Use strong passwords for database users

## Next Steps

After setting up the database:

1. Test all API endpoints
2. Update frontend to use the new database-backed API
3. Set up proper authentication (JWT tokens)
4. Implement file upload to cloud storage (AWS S3, etc.)
5. Add email verification and password reset functionality

## Support

If you encounter issues:

1. Check the Prisma documentation: https://www.prisma.io/docs
2. Verify your database connection string
3. Check the server logs for error messages
4. Ensure all environment variables are set correctly 