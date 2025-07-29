import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CommunityPost, PostRating, GradeLevel } from '@/types';

interface CommunityState {
  posts: CommunityPost[];
  ratings: PostRating[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: (filters?: {
    type?: string;
    category?: string;
    gradeLevel?: GradeLevel;
    subject?: string;
  }) => Promise<CommunityPost[]>;
  addPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'downloads' | 'rating' | 'ratingCount'>) => Promise<CommunityPost>;
  ratePost: (postId: string, userId: string, rating: number) => Promise<void>;
  incrementDownloads: (postId: string) => void;
  clearError: () => void;
}

// API endpoints (will be replaced with real backend)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.1:3001/api';

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: [],
      ratings: [],
      isLoading: false,
      error: null,
      
      clearError: () => set({ error: null }),
      
      fetchPosts: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          let url = `${API_BASE_URL}/community/posts?`;
          if (filters?.type) url += `type=${filters.type}&`;
          if (filters?.category) url += `category=${filters.category}&`;
          if (filters?.gradeLevel) url += `gradeLevel=${filters.gradeLevel}&`;
          if (filters?.subject) url += `subject=${filters.subject}&`;
          const response = await fetch(url);
          const posts = await response.json();
          set({ posts, isLoading: false });
          return posts;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      addPost: async (postData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/community/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
          });
          const newPost = await response.json();
          set(state => ({ posts: [...state.posts, newPost], isLoading: false }));
          return newPost;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      ratePost: async (postId, userId, rating) => {
        try {
          await fetch(`${API_BASE_URL}/community/posts/${postId}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, rating }),
          });
          // Optionally update local ratings state if needed
        } catch (error) {
          // Optionally handle error
        }
      },
      
      incrementDownloads: (postId) => {
        // Implement if backend supports download tracking
      },
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ ratings: state.ratings }), // Only persist ratings
    }
  )
);