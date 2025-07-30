import { create } from 'zustand';
import { Course, Assignment, Resource, GradeLevel } from '@/types';

interface CoursesState {
  courses: Course[];
  assignments: Assignment[];
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: (gradeLevel?: GradeLevel) => Promise<Course[]>;
  fetchCourseById: (id: string) => Promise<Course | undefined>;
  fetchAssignments: (courseId: string) => Promise<Assignment[]>;
  fetchResources: (courseId?: string, gradeLevel?: GradeLevel) => Promise<Resource[]>;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Promise<Course>;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => Promise<Assignment>;
  addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => Promise<Resource>;
  clearError: () => void;
}

// API endpoints (will be replaced with real backend)
const API_BASE_URL = 'https://fundamental.onrender.com/api';

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  assignments: [],
  resources: [],
  isLoading: false,
  error: null,
  
  clearError: () => set({ error: null }),
  
  fetchCourses: async (gradeLevel) => {
    set({ isLoading: true, error: null });
    try {
      const url = gradeLevel 
        ? `${API_BASE_URL}/courses?gradeLevel=${gradeLevel}`
        : `${API_BASE_URL}/courses`;
      const response = await fetch(url);
      const data = await response.json();
      set({ courses: data.courses, isLoading: false });
      return data.courses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  fetchCourseById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`);
      const course = await response.json();
      set({ isLoading: false });
      return course;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch course';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  fetchAssignments: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assignments`);
      const data = await response.json();
      set({ assignments: data.assignments, isLoading: false });
      return data.assignments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch assignments';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  fetchResources: async (courseId, gradeLevel) => {
    set({ isLoading: true, error: null });
    try {
      let url = `${API_BASE_URL}/resources?`;
      if (courseId) url += `courseId=${courseId}&`;
      if (gradeLevel) url += `gradeLevel=${gradeLevel}`;
      const response = await fetch(url);
      const data = await response.json();
      set({ resources: data.resources, isLoading: false });
      return data.resources;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch resources';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  addCourse: async (courseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      const newCourse = await response.json();
      set(state => ({ courses: [...state.courses, newCourse], isLoading: false }));
      return newCourse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  addAssignment: async (assignmentData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      Object.entries(assignmentData).forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'uri' in value && !Array.isArray(value)) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });
      const response = await fetch(`${API_BASE_URL}/assignments/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      set(state => ({ assignments: [...state.assignments, data.assignment], isLoading: false }));
      return data.assignment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create assignment';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  addResource: async (resourceData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      Object.entries(resourceData).forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'uri' in value && !Array.isArray(value)) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });
      const response = await fetch(`${API_BASE_URL}/resources/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      set(state => ({ resources: [...state.resources, data.resource], isLoading: false }));
      return data.resource;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create resource';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
}));