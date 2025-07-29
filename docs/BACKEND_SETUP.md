# Backend Setup Instructions for FUNDAmental

## Overview
This document provides instructions for setting up a real backend for the FUNDAmental e-learning app. Currently, the app uses mock data and is ready for backend integration.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  grade_level VARCHAR(50),
  school VARCHAR(255),
  institution VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id),
  grade_level VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Course Enrollments Table
```sql
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  student_id UUID REFERENCES users(id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, student_id)
);
```

### Assignments Table
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  points INTEGER DEFAULT 0,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assignment Submissions Table
```sql
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES users(id),
  content TEXT,
  attachments JSONB,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  grade INTEGER,
  feedback TEXT,
  graded_at TIMESTAMP,
  graded_by UUID REFERENCES users(id),
  UNIQUE(assignment_id, student_id)
);
```

### Resources Table
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('document', 'video', 'quiz', 'other')),
  file_url TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  grade_level VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Community Posts Table
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('past_paper', 'notes', 'course_outline', 'study_guide', 'other')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('zimsec', 'hexco', 'university', 'polytechnic')),
  grade_level VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  author_id UUID REFERENCES users(id),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Post Ratings Table
```sql
CREATE TABLE post_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Courses
- `GET /api/courses` - Get courses (with filters)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (teachers only)
- `PUT /api/courses/:id` - Update course (teachers only)
- `DELETE /api/courses/:id` - Delete course (teachers only)
- `POST /api/courses/:id/enroll` - Enroll in course (students only)

### Assignments
- `GET /api/courses/:courseId/assignments` - Get course assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments` - Create assignment (teachers only)
- `PUT /api/assignments/:id` - Update assignment (teachers only)
- `DELETE /api/assignments/:id` - Delete assignment (teachers only)

### Assignment Submissions
- `GET /api/assignments/:id/submissions` - Get assignment submissions (teachers only)
- `POST /api/assignments/:id/submit` - Submit assignment (students only)
- `PUT /api/submissions/:id/grade` - Grade submission (teachers only)

### Resources
- `GET /api/resources` - Get resources (with filters)
- `POST /api/resources` - Create resource (teachers only)
- `PUT /api/resources/:id` - Update resource (teachers only)
- `DELETE /api/resources/:id` - Delete resource (teachers only)

### Community
- `GET /api/community/posts` - Get community posts (with filters)
- `POST /api/community/posts` - Create community post
- `PUT /api/community/posts/:id` - Update community post (author only)
- `DELETE /api/community/posts/:id` - Delete community post (author only)
- `POST /api/community/posts/:id/rate` - Rate community post
- `POST /api/community/posts/:id/download` - Increment download count

### File Upload
- `POST /api/upload` - Upload files (images, documents, etc.)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/fundamental_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# File Storage (AWS S3 or similar)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=fundamental-files
AWS_REGION=us-east-1

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Settings
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:8081
```

## Technology Stack Recommendations

### Backend Framework
- **Node.js with Express.js** - Fast and flexible
- **TypeScript** - Type safety and better development experience

### Database
- **PostgreSQL** - Robust relational database with JSON support
- **Prisma** - Modern ORM for type-safe database access

### Authentication
- **JWT** - Stateless authentication
- **bcrypt** - Password hashing

### File Storage
- **AWS S3** or **Cloudinary** - Scalable file storage
- **Multer** - File upload middleware

### Real-time Features
- **Socket.io** - Real-time communication for live classes

## Getting Started

1. **Set up the database:**
   ```bash
   createdb fundamental_db
   psql fundamental_db < schema.sql
   ```

2. **Install dependencies:**
   ```bash
   npm install express typescript prisma bcryptjs jsonwebtoken multer socket.io
   npm install -D @types/node @types/express @types/bcryptjs @types/jsonwebtoken
   ```

3. **Set up Prisma:**
   ```bash
   npx prisma init
   npx prisma generate
   npx prisma db push
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Security Considerations

1. **Input Validation** - Use libraries like Joi or Yup
2. **Rate Limiting** - Implement rate limiting for API endpoints
3. **CORS** - Configure CORS properly for production
4. **File Upload Security** - Validate file types and sizes
5. **SQL Injection Prevention** - Use parameterized queries
6. **XSS Protection** - Sanitize user inputs

## Performance Optimizations

1. **Database Indexing** - Add indexes on frequently queried columns
2. **Caching** - Use Redis for caching frequently accessed data
3. **Pagination** - Implement pagination for large datasets
4. **Image Optimization** - Compress and resize images
5. **CDN** - Use CDN for static file delivery

## Deployment

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Using Railway/Heroku
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## Testing

Set up testing with Jest and Supertest:
```bash
npm install -D jest supertest @types/jest @types/supertest
```

## Monitoring

Consider using:
- **Sentry** - Error tracking
- **New Relic** - Performance monitoring
- **LogRocket** - User session recording

## Next Steps

1. Enable backend in your project settings
2. Set up the database schema
3. Implement the API endpoints
4. Update the frontend stores to use real API calls
5. Test thoroughly
6. Deploy to production

For any questions or assistance with backend setup, please refer to the documentation or contact the development team.