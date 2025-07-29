import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DownloadedContent } from '@/types';

interface OfflineState {
  downloadedContent: DownloadedContent[];
  isDownloading: { [key: string]: boolean };
  downloadProgress: { [key: string]: number };
  addDownload: (content: DownloadedContent) => void;
  removeDownload: (id: string) => void;
  setDownloading: (id: string, isDownloading: boolean) => void;
  setDownloadProgress: (id: string, progress: number) => void;
  isContentDownloaded: (id: string) => boolean;
  getDownloadedContent: () => DownloadedContent[];
  getTotalDownloadSize: () => number;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      downloadedContent: [],
      isDownloading: {},
      downloadProgress: {},
      
      addDownload: (content) => {
        set(state => ({
          downloadedContent: [...state.downloadedContent, content],
          isDownloading: { ...state.isDownloading, [content.id]: false },
          downloadProgress: { ...state.downloadProgress, [content.id]: 100 },
        }));
      },
      
      removeDownload: (id) => {
        set(state => ({
          downloadedContent: state.downloadedContent.filter(item => item.id !== id),
          isDownloading: { ...state.isDownloading, [id]: false },
          downloadProgress: { ...state.downloadProgress, [id]: 0 },
        }));
      },
      
      setDownloading: (id, isDownloading) => {
        set(state => ({
          isDownloading: { ...state.isDownloading, [id]: isDownloading },
        }));
      },
      
      setDownloadProgress: (id, progress) => {
        set(state => ({
          downloadProgress: { ...state.downloadProgress, [id]: progress },
        }));
      },
      
      isContentDownloaded: (id) => {
        return get().downloadedContent.some(item => item.id === id);
      },
      
      getDownloadedContent: () => {
        return get().downloadedContent;
      },
      
      getTotalDownloadSize: () => {
        return get().downloadedContent.reduce((total, item) => total + item.size, 0);
      },
    }),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);