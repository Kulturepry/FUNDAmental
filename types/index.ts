export type UserRole = 'student' | 'teacher' | 'admin';

export type EducationLevel = 
  | 'primary' 
  | 'secondary' 
  | 'university'
  | 'polytechnic';

export type GradeLevel = 
  | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5' | 'grade6' | 'grade7'
  | 'form1' | 'form2' | 'form3' | 'form4' | 'form5' | 'form6'
  | 'university_accounting' | 'university_agriculture' | 'university_architecture'
  | 'university_business' | 'university_chemistry' | 'university_computer_science'
  | 'university_economics' | 'university_education' | 'university_engineering'
  | 'university_english' | 'university_environmental_science' | 'university_geography'
  | 'university_history' | 'university_law' | 'university_mathematics'
  | 'university_medicine' | 'university_nursing' | 'university_pharmacy'
  | 'university_physics' | 'university_psychology' | 'university_sociology'
  | 'polytechnic_automotive' | 'polytechnic_building' | 'polytechnic_electrical'
  | 'polytechnic_hospitality' | 'polytechnic_information_technology'
  | 'polytechnic_mechanical' | 'polytechnic_textile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  gradeLevel?: GradeLevel;
  school?: string;
  institution?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  gradeLevel: GradeLevel;
  subject: string;
  coverImage?: string;
  students: string[]; // Array of student IDs
  createdAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  attachments?: string[];
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'quiz' | 'other';
  url: string;
  courseId: string;
  gradeLevel: GradeLevel;
  subject: string;
  createdAt: string;
  isDownloaded?: boolean;
  downloadPath?: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  description: string;
  type: 'past_paper' | 'notes' | 'course_outline' | 'study_guide' | 'other';
  category: 'school' | 'university' | 'polytechnic';
  gradeLevel: GradeLevel;
  subject: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  authorId: string;
  authorName: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  isDownloaded?: boolean;
  downloadPath?: string;
}

export interface PostRating {
  id: string;
  postId: string;
  userId: string;
  rating: number; // 1-5 stars
  createdAt: string;
}

export interface DownloadedContent {
  id: string;
  type: 'resource' | 'community_post';
  title: string;
  filePath: string;
  downloadedAt: string;
  size: number;
}