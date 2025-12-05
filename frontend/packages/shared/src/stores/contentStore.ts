import { create } from 'zustand';
import type { Content } from '../types/api';

interface ContentState {
  contents: Content[];
  selectedContent: Content | null;
  isUploading: boolean;
  uploadProgress: number;
  setContents: (contents: Content[]) => void;
  addContent: (content: Content) => void;
  updateContent: (contentId: string, updates: Partial<Content>) => void;
  removeContent: (contentId: string) => void;
  setSelectedContent: (content: Content | null) => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
  clearContents: () => void;
}

export const useContentStore = create<ContentState>((set) => ({
  contents: [],
  selectedContent: null,
  isUploading: false,
  uploadProgress: 0,

  setContents: (contents) => set({ contents }),

  addContent: (content) =>
    set((state) => ({
      contents: [content, ...state.contents],
    })),

  updateContent: (contentId, updates) =>
    set((state) => ({
      contents: state.contents.map((c) =>
        c.contentId === contentId ? { ...c, ...updates } : c
      ),
      selectedContent:
        state.selectedContent?.contentId === contentId
          ? { ...state.selectedContent, ...updates }
          : state.selectedContent,
    })),

  removeContent: (contentId) =>
    set((state) => ({
      contents: state.contents.filter((c) => c.contentId !== contentId),
      selectedContent:
        state.selectedContent?.contentId === contentId
          ? null
          : state.selectedContent,
    })),

  setSelectedContent: (content) => set({ selectedContent: content }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  setIsUploading: (isUploading) => set({ isUploading }),

  clearContents: () =>
    set({
      contents: [],
      selectedContent: null,
      isUploading: false,
      uploadProgress: 0,
    }),
}));
