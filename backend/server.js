const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'FUNDAmental Backend API is running!', status: 'healthy' });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- ASSIGNMENTS ---
app.post('/api/assignments/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description, classId, uploadedBy } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        classId,
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: parseInt(uploadedBy) || 1, // Default to user 1 if not provided
      },
    });
    res.json({ assignment });
  } catch (error) {
    console.error('Assignment upload error:', error);
    res.status(500).json({ message: 'Failed to upload assignment' });
  }
});

app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        uploader: {
          select: { name: true, email: true }
        }
      }
    });
    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Failed to get assignments' });
  }
});

app.get('/api/assignments/:id/download', async (req, res) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    res.download(assignment.path, assignment.originalname);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// --- RESOURCES ---
app.post('/api/resources/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description, type, subject, subjectId, uploadedBy } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type,
        subject,
        subjectId,
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: parseInt(uploadedBy) || 1, // Default to user 1 if not provided
      },
    });
    res.json({ resource });
  } catch (error) {
    console.error('Resource upload error:', error);
    res.status(500).json({ message: 'Failed to upload resource' });
  }
});

app.get('/api/resources', async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        uploader: {
          select: { name: true, email: true }
        }
      }
    });
    res.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Failed to get resources' });
  }
});

app.get('/api/resources/:id/download', async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.download(resource.path, resource.originalname);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// --- AUTHENTICATION ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, gradeLevel } = req.body;
    if (!name || !email || !password || !role || !gradeLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, hash the password!
        role,
        gradeLevel,
      },
    });
    
    // Don't return password to client
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Don't return password to client
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// Avatar upload endpoint
app.post('/api/auth/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    
    const url = `https://${req.hostname}/uploads/${file.filename}`;
    res.json({ url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Profile update endpoint
app.post('/api/auth/update-profile', async (req, res) => {
  try {
    const { id, name, gradeLevel, school, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        gradeLevel,
        school,
        avatar,
      },
    });
    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password endpoint
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: newPassword }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // In a real app, send an email with reset link
    // For demo, just return success
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// --- COURSES ---
app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, gradeLevel, subject, teacherId } = req.body;
    if (!title || !gradeLevel || !subject || !teacherId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const course = await prisma.course.create({
      data: {
        title,
        description,
        gradeLevel,
        subject,
        teacherId: parseInt(teacherId),
      },
    });
    res.json({ course });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: {
          select: { name: true, email: true }
        },
        enrollments: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Failed to get courses' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        teacher: {
          select: { name: true, email: true }
        },
        enrollments: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Failed to get course' });
  }
});

app.post('/api/courses/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) return res.status(400).json({ message: 'Missing userId' });
    
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: parseInt(userId),
        courseId: parseInt(id),
      },
    });
    res.json({ enrollment });
  } catch (error) {
    console.error('Join course error:', error);
    res.status(500).json({ message: 'Failed to join course' });
  }
});

app.post('/api/courses/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) return res.status(400).json({ message: 'Missing userId' });
    
    await prisma.courseEnrollment.deleteMany({
      where: {
        userId: parseInt(userId),
        courseId: parseInt(id),
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Leave course error:', error);
    res.status(500).json({ message: 'Failed to leave course' });
  }
});

// --- COMMUNITY POSTS ---
app.get('/api/community/posts', async (req, res) => {
  try {
    const { type, category, gradeLevel, subject } = req.query;
    const where = {};
    
    if (type) where.type = type;
    if (category) where.category = category;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (subject) where.subject = { contains: subject, mode: 'insensitive' };
    
    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(posts);
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ message: 'Failed to get community posts' });
  }
});

app.post('/api/community/posts', async (req, res) => {
  try {
    const { title, description, type, category, subject, authorId, authorName, gradeLevel } = req.body;
    if (!title || !description || !type || !category || !subject || !authorId || !authorName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const post = await prisma.communityPost.create({
      data: {
        title,
        description,
        type,
        category,
        subject,
        authorId: parseInt(authorId),
        authorName,
        gradeLevel,
      },
    });
    res.json(post);
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({ message: 'Failed to create community post' });
  }
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    const notifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        title,
        message,
      },
    });
    res.json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// --- COMMENTS ---
app.post('/api/comments', async (req, res) => {
  try {
    const { type, itemId, userId, userName, text } = req.body;
    if (!type || !itemId || !userId || !userName || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (user.banned) {
      return res.status(403).json({ message: 'User is banned from commenting' });
    }
    
    const comment = await prisma.comment.create({
      data: {
        type,
        itemId: parseInt(itemId),
        userId: parseInt(userId),
        userName,
        text,
      },
    });
    res.json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

app.get('/api/comments', async (req, res) => {
  try {
    const { type, id } = req.query;
    if (!type || !id) return res.status(400).json({ message: 'Missing type or id' });
    
    const comments = await prisma.comment.findMany({
      where: {
        type,
        itemId: parseInt(id),
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await prisma.comment.findMany({
          where: { parentId: comment.id },
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
        return { ...comment, replies };
      })
    );
    
    res.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to get comments' });
  }
});

// --- CHAT ---
app.get('/api/courses/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.chatMessage.findMany({
      where: { courseId: parseInt(id) },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { timestamp: 'asc' }
    });
    res.json({ messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Failed to get chat messages' });
  }
});

app.post('/api/courses/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, text } = req.body;
    if (!userId || !userName || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const message = await prisma.chatMessage.create({
      data: {
        courseId: parseInt(id),
        userId: parseInt(userId),
        userName,
        text,
      },
    });
    res.json({ message });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Start server
async function startServer() {
  try {
    await testDatabaseConnection();
    app.listen(PORT, () => {
      console.log(`FUNDAmental Backend API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 