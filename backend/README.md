# FUNDAmental Backend API

This is the backend API for the FUNDAmental learning app.

## Features

- User authentication (register, login, password reset)
- File upload/download for assignments and resources
- Course management (create, join, leave)
- Community posts and ratings
- Comments system with moderation
- Class chat functionality
- Notifications system

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## Deployment

### Option 1: Railway (Recommended)

1. Sign up at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Deploy automatically

### Option 2: Render

1. Sign up at [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Select the `backend` folder
5. Set build command: `npm install`
6. Set start command: `npm start`

### Option 3: Heroku

1. Sign up at [Heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Run these commands:
   ```bash
   heroku create your-app-name
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

## Environment Variables

- `PORT`: Server port (default: 3001)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/change-password` - Change password

### Files
- `POST /api/assignments/upload` - Upload assignment
- `GET /api/assignments` - Get assignments
- `GET /api/assignments/:id/download` - Download assignment
- `POST /api/resources/upload` - Upload resource
- `GET /api/resources` - Get resources
- `GET /api/resources/:id/download` - Download resource

### Courses
- `POST /api/courses` - Create course
- `GET /api/courses` - Get courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/join` - Join course
- `POST /api/courses/:id/leave` - Leave course

### Community
- `GET /api/community/posts` - Get posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/rate` - Rate post

### Comments
- `GET /api/comments` - Get comments
- `POST /api/comments` - Create comment
- `PATCH /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/reply` - Reply to comment

### Chat
- `GET /api/courses/:id/chat` - Get chat messages
- `POST /api/courses/:id/chat` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read 