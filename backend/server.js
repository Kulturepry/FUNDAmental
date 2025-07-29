const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

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

// In-memory data storage (replace with database in production)
let users = [];
let courses = [];
let assignments = [];
let resources = [];
let notifications = [];
let comments = [];
let bannedUsers = [];
let courseChats = {};
let communityPosts = [];

// --- ASSIGNMENTS ---
app.post('/api/assignments/upload', upload.single('file'), (req, res) => {
  const { title, description, classId } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });
  const assignment = {
    id: assignments.length + 1,
    title,
    description,
    classId,
    filename: file.filename,
    originalname: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
  assignments.push(assignment);
  res.json({ assignment });
});

app.get('/api/assignments', (req, res) => {
  res.json({ assignments });
});

app.get('/api/assignments/:id/download', (req, res) => {
  const assignment = assignments.find(a => a.id == req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Not found' });
  res.download(assignment.path, assignment.originalname);
});

// --- RESOURCES ---
app.post('/api/resources/upload', upload.single('file'), (req, res) => {
  const { title, description, subjectId } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });
  const resource = {
    id: resources.length + 1,
    title,
    description,
    subjectId,
    filename: file.filename,
    originalname: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
  resources.push(resource);
  res.json({ resource });
});

app.get('/api/resources', (req, res) => {
  res.json({ resources });
});

app.get('/api/resources/:id/download', (req, res) => {
  const resource = resources.find(r => r.id == req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });
  res.download(resource.path, resource.originalname);
});

app.listen(PORT, () => {
  console.log(`File upload/download API running at http://localhost:${PORT}`);
});

// In-memory user store for demo
const users = [];

// Registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, gradeLevel } = req.body;
  if (!name || !email || !password || !role || !gradeLevel) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  const user = {
    id: users.length + 1,
    name,
    email,
    password, // In production, hash the password!
    role,
    gradeLevel,
  };
  users.push(user);
  // Don't return password to client
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  // Don't return password to client
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Avatar upload endpoint
app.post('/api/auth/upload-avatar', upload.single('avatar'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No file uploaded' });
  // For demo, return a local URL
  const url = `http://${req.hostname}:${PORT}/uploads/${file.filename}`;
  res.json({ url });
});

// Profile update endpoint
app.post('/api/auth/update-profile', (req, res) => {
  const { id, name, gradeLevel, school, avatar } = req.body;
  const user = users.find(u => u.id == id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (name) user.name = name;
  if (gradeLevel) user.gradeLevel = gradeLevel;
  if (school) user.school = school;
  if (avatar) user.avatar = avatar;
  res.json({ user: { ...user, password: undefined } });
});

// Change password endpoint
app.post('/api/auth/change-password', (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  const user = users.find(u => u.id == id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.password !== currentPassword) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  res.json({ success: true });
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  // In a real app, send an email with reset link
  // For demo, just return success
  res.json({ message: 'If the email exists, a reset link has been sent' });
});

// In-memory community posts store
const communityPosts = [];

// Get community posts
app.get('/api/community/posts', (req, res) => {
  const { type, category, gradeLevel, subject } = req.query;
  let filteredPosts = [...communityPosts];
  
  if (type) filteredPosts = filteredPosts.filter(post => post.type === type);
  if (category) filteredPosts = filteredPosts.filter(post => post.category === category);
  if (gradeLevel) filteredPosts = filteredPosts.filter(post => post.gradeLevel === gradeLevel);
  if (subject) filteredPosts = filteredPosts.filter(post => post.subject.toLowerCase().includes(subject.toLowerCase()));
  
  res.json(filteredPosts);
});

// Create community post
app.post('/api/community/posts', (req, res) => {
  const { title, description, type, category, subject, authorId, authorName, gradeLevel } = req.body;
  if (!title || !description || !type || !category || !subject || !authorId || !authorName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const post = {
    id: communityPosts.length + 1,
    title,
    description,
    type,
    category,
    subject,
    authorId,
    authorName,
    gradeLevel,
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
  };
  communityPosts.push(post);
  res.json(post);
});

// Rate a community post
app.post('/api/community/posts/:id/rate', (req, res) => {
  const { id } = req.params;
  const { userId, rating } = req.body;
  const post = communityPosts.find(p => p.id == id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  // In a real app, store ratings separately and calculate average
  res.json({ success: true });
});

// In-memory notifications store
const notifications = [];

// Get notifications for a user
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  const userNotifications = notifications.filter(n => n.userId == userId);
  res.json({ notifications: userNotifications });
});

// Create notification
app.post('/api/notifications', (req, res) => {
  const { userId, title, message } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const notification = {
    id: notifications.length + 1,
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notification);
  res.json(notification);
});

// Mark notification as read
app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id == id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  notification.read = true;
  res.json(notification);
});

// In-memory courses store
const courses = [];

// Create course (teacher only)
app.post('/api/courses', (req, res) => {
  const { title, description, gradeLevel, subject, teacherId } = req.body;
  if (!title || !gradeLevel || !subject || !teacherId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const course = {
    id: courses.length + 1,
    title,
    description,
    gradeLevel,
    subject,
    teacherId,
    students: [],
    createdAt: new Date(),
  };
  courses.push(course);
  res.json({ course });
});

// List all courses
app.get('/api/courses', (req, res) => {
  res.json({ courses });
});

// Get a single course by ID
app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => String(c.id) === String(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

// Get assignments for a course
app.get('/api/courses/:courseId/assignments', (req, res) => {
  const { courseId } = req.params;
  const courseAssignments = assignments.filter(a => String(a.courseId) === String(courseId));
  res.json({ assignments: courseAssignments });
});

// Join course (student)
app.post('/api/courses/:id/join', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const course = courses.find(c => c.id == id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  if (!course.students.includes(userId)) {
    course.students.push(userId);
  }
  res.json({ course });
});

// Leave course (student)
app.post('/api/courses/:id/leave', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const course = courses.find(c => c.id == id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  course.students = course.students.filter(uid => uid !== userId);
  res.json({ course });
});

// In-memory comments store
const comments = [];

// In-memory banned users
const bannedUsers = [];

// Report a comment
app.post('/api/comments/:id/report', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const comment = comments.find(c => c.id == id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (!comment.reports) comment.reports = [];
  if (!comment.reports.includes(userId)) comment.reports.push(userId);
  res.json({ comment });
});

// Get reported comments (moderators only)
app.get('/api/comments/reported', (req, res) => {
  const reported = comments.filter(c => c.reports && c.reports.length > 0);
  res.json({ comments: reported });
});

// Ban a user (moderators only)
app.post('/api/users/:id/ban', (req, res) => {
  const { id } = req.params;
  if (!bannedUsers.includes(id)) bannedUsers.push(id);
  res.json({ success: true });
});

// Prevent banned users from posting comments
const isBanned = (userId) => bannedUsers.includes(userId);

// Add a comment
app.post('/api/comments', (req, res) => {
  const { type, itemId, userId, userName, text } = req.body;
  if (!type || !itemId || !userId || !userName || !text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (isBanned(userId)) {
    return res.status(403).json({ message: 'User is banned from commenting' });
  }
  const comment = {
    id: comments.length + 1,
    type, // 'resource' or 'assignment'
    itemId,
    userId,
    userName,
    text,
    createdAt: new Date(),
    reports: [],
  };
  comments.push(comment);
  res.json({ comment });
});

// Edit a comment
app.patch('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { text, userId } = req.body;
  const comment = comments.find(c => c.id == id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.userId !== userId) return res.status(403).json({ message: 'Not allowed' });
  comment.text = text;
  res.json({ comment });
});

// Delete a comment (poster or teacher/admin)
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { userId, isModerator } = req.body;
  const idx = comments.findIndex(c => c.id == id);
  if (idx === -1) return res.status(404).json({ message: 'Comment not found' });
  const comment = comments[idx];
  if (comment.userId !== userId && !isModerator) return res.status(403).json({ message: 'Not allowed' });
  comments.splice(idx, 1);
  // Also delete replies
  for (let i = comments.length - 1; i >= 0; i--) {
    if (comments[i].parentId == id) comments.splice(i, 1);
  }
  res.json({ success: true });
});

// Add a reply to a comment
app.post('/api/comments/:id/reply', (req, res) => {
  const { id } = req.params;
  const { type, itemId, userId, userName, text } = req.body;
  if (!type || !itemId || !userId || !userName || !text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (isBanned(userId)) {
    return res.status(403).json({ message: 'User is banned from commenting' });
  }
  const reply = {
    id: comments.length + 1,
    type,
    itemId,
    userId,
    userName,
    text,
    parentId: id,
    createdAt: new Date(),
    reports: [],
  };
  comments.push(reply);
  res.json({ comment: reply });
});

// Get comments for a resource or assignment (threaded)
app.get('/api/comments', (req, res) => {
  const { type, id } = req.query;
  if (!type || !id) return res.status(400).json({ message: 'Missing type or id' });
  // Get top-level comments
  const itemComments = comments.filter(c => c.type === type && c.itemId == id && !c.parentId);
  // Attach replies
  const withReplies = itemComments.map(c => ({
    ...c,
    replies: comments.filter(r => r.parentId == c.id)
  }));
  res.json({ comments: withReplies });
});

// In-memory chat messages per course
const courseChats = {};

// Get chat messages for a course
app.get('/api/courses/:id/chat', (req, res) => {
  const { id } = req.params;
  if (!courseChats[id]) courseChats[id] = [];
  res.json({ messages: courseChats[id] });
});

// Send a chat message to a course
app.post('/api/courses/:id/chat', (req, res) => {
  const { id } = req.params;
  const { userId, userName, text } = req.body;
  if (!userId || !userName || !text) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const course = courses.find(c => String(c.id) === String(id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!course.students.includes(userId) && course.teacherId !== userId) {
    return res.status(403).json({ message: 'Not a member of this course' });
  }
  if (!courseChats[id]) courseChats[id] = [];
  const message = {
    id: courseChats[id].length + 1,
    userId,
    userName,
    text,
    timestamp: new Date().toISOString(),
  };
  courseChats[id].push(message);
  res.json({ message });
});