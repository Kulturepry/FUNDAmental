import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Example Express-style API for file upload/download (Node.js/Express reference)
// This is a template for your backend implementation
// You can move this to a separate backend project if needed

// Install dependencies: express, multer, cors
// npm install express multer cors

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// In-memory storage for demo
const assignments: any[] = [];
const resources: any[] = [];

// --- ASSIGNMENTS ---
app.post('/api/assignments/upload', upload.single('file'), (req: any, res: any) => {
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

app.get('/api/assignments', (req: any, res: any) => {
  res.json({ assignments });
});

app.get('/api/assignments/:id/download', (req: any, res: any) => {
  const assignment = assignments.find(a => a.id == req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Not found' });
  res.download(assignment.path, assignment.originalname);
});

// --- RESOURCES ---
app.post('/api/resources/upload', upload.single('file'), (req: any, res: any) => {
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

app.get('/api/resources', (req: any, res: any) => {
  res.json({ resources });
});

app.get('/api/resources/:id/download', (req: any, res: any) => {
  const resource = resources.find(r => r.id == req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });
  res.download(resource.path, resource.originalname);
});

app.listen(port, () => {
  console.log(`File upload/download API running at http://localhost:${port}`);
});

export default publicProcedure
  .input(z.object({ name: z.string() }))
  .mutation(({ input }) => {
    return {
      hello: input.name,
      date: new Date(),
    };
  });