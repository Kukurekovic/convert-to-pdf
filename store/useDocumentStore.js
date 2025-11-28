import { create } from 'zustand';
import * as FileSystem from 'expo-file-system/legacy';

const useDocumentStore = create((set, get) => ({
  // Current session images
  images: [],
  currentImageIndex: 0,

  // Saved PDFs
  savedPDFs: [],

  // App settings
  settings: {
    autoEnhance: true,
    defaultQuality: 'high',
    showTutorial: true,
  },

  // Actions for images
  addImage: (image) => set((state) => ({
    images: [...state.images, image]
  })),

  removeImage: (index) => set((state) => ({
    images: state.images.filter((_, i) => i !== index),
    currentImageIndex: Math.min(state.currentImageIndex, state.images.length - 2)
  })),

  updateImage: (index, updatedImage) => set((state) => ({
    images: state.images.map((img, i) => i === index ? updatedImage : img)
  })),

  clearImages: () => set({ images: [], currentImageIndex: 0 }),

  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),

  // Actions for PDFs
  addPDF: (pdf) => set((state) => ({
    savedPDFs: [pdf, ...state.savedPDFs]
  })),

  removePDF: async (id) => {
    const state = get();
    const pdf = state.savedPDFs.find(p => p.id === id);

    if (pdf) {
      try {
        // Delete the PDF file
        await FileSystem.deleteAsync(pdf.uri, { idempotent: true });

        // Delete thumbnail if exists
        if (pdf.thumbnail) {
          await FileSystem.deleteAsync(pdf.thumbnail, { idempotent: true });
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }

    set((state) => ({
      savedPDFs: state.savedPDFs.filter(p => p.id !== id)
    }));
  },

  clearAllPDFs: async () => {
    const state = get();

    // Delete all PDF files
    for (const pdf of state.savedPDFs) {
      try {
        await FileSystem.deleteAsync(pdf.uri, { idempotent: true });
        if (pdf.thumbnail) {
          await FileSystem.deleteAsync(pdf.thumbnail, { idempotent: true });
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }

    set({ savedPDFs: [] });
  },

  loadPDFs: async () => {
    try {
      const documentsDir = `${FileSystem.documentDirectory}pdfs/`;
      const dirInfo = await FileSystem.getInfoAsync(documentsDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
        return;
      }

      const files = await FileSystem.readDirectoryAsync(documentsDir);
      const pdfFiles = files.filter(f => f.endsWith('.pdf'));

      const pdfs = await Promise.all(
        pdfFiles.map(async (filename) => {
          const uri = `${documentsDir}${filename}`;
          const info = await FileSystem.getInfoAsync(uri);

          return {
            id: filename.replace('.pdf', ''),
            name: filename.replace('.pdf', ''),
            uri,
            size: info.size,
            createdAt: info.modificationTime,
            thumbnail: null,
          };
        })
      );

      set({ savedPDFs: pdfs.sort((a, b) => b.createdAt - a.createdAt) });
    } catch (error) {
      console.error('Error loading PDFs:', error);
    }
  },

  // Settings actions
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
}));

export default useDocumentStore;
