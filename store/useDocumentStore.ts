import { create } from 'zustand';
import * as FileSystem from 'expo-file-system/legacy';
import type { DocumentStoreState, AppSettings } from '../types/store';
import type { ImageAsset, PDFDocument } from '../types/document';

const useDocumentStore = create<DocumentStoreState>((set, get) => ({
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
  addImage: (image: ImageAsset) => set((state) => ({
    images: [...state.images, image]
  })),

  removeImage: (index: number) => set((state) => ({
    images: state.images.filter((_, i) => i !== index),
    currentImageIndex: Math.min(state.currentImageIndex, state.images.length - 2)
  })),

  updateImage: (index: number, updatedImage: ImageAsset) => set((state) => ({
    images: state.images.map((img, i) => i === index ? updatedImage : img)
  })),

  clearImages: () => set({ images: [], currentImageIndex: 0 }),

  setCurrentImageIndex: (index: number) => set({ currentImageIndex: index }),

  // Actions for PDFs
  addPDF: (pdf: PDFDocument) => set((state) => ({
    savedPDFs: [pdf, ...state.savedPDFs]
  })),

  removePDF: async (id: string) => {
    const state = get();
    const pdf = state.savedPDFs.find(p => p.id === id);

    if (pdf) {
      try {
        // Delete the PDF file
        await FileSystem.deleteAsync(pdf.uri, { idempotent: true });

        // Delete main thumbnail if exists
        if (pdf.thumbnail) {
          await FileSystem.deleteAsync(pdf.thumbnail, { idempotent: true });
        }

        // Delete all page thumbnails if they exist
        if (pdf.pageThumbnails) {
          for (const pageThumb of pdf.pageThumbnails) {
            await FileSystem.deleteAsync(pageThumb, { idempotent: true });
          }
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }

    set((state) => ({
      savedPDFs: state.savedPDFs.filter(p => p.id !== id)
    }));
  },

  renamePDF: (id: string, newName: string) => set((state) => ({
    savedPDFs: state.savedPDFs.map(p =>
      p.id === id ? { ...p, name: newName } : p
    )
  })),

  reorderPages: (id: string, newPageOrder: string[]) => set((state) => ({
    savedPDFs: state.savedPDFs.map(p =>
      p.id === id ? { ...p, pageThumbnails: newPageOrder } : p
    )
  })),

  deletePages: (id: string, pageIndicesToDelete: number[]) => set((state) => ({
    savedPDFs: state.savedPDFs.map(p => {
      if (p.id === id && p.pageThumbnails) {
        const newPageThumbnails = p.pageThumbnails.filter(
          (_, index) => !pageIndicesToDelete.includes(index)
        );
        return {
          ...p,
          pageThumbnails: newPageThumbnails,
          thumbnail: newPageThumbnails.length > 0 ? newPageThumbnails[0] : p.thumbnail
        };
      }
      return p;
    })
  })),

  clearAllPDFs: async () => {
    const state = get();

    // Delete all PDF files
    for (const pdf of state.savedPDFs) {
      try {
        await FileSystem.deleteAsync(pdf.uri, { idempotent: true });
        if (pdf.thumbnail) {
          await FileSystem.deleteAsync(pdf.thumbnail, { idempotent: true });
        }
        if (pdf.pageThumbnails) {
          for (const pageThumb of pdf.pageThumbnails) {
            await FileSystem.deleteAsync(pageThumb, { idempotent: true });
          }
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }

    set({ savedPDFs: [] });
  },

  loadPDFs: async () => {
    try {
      const documentsDir = `${FileSystem.documentDirectory ?? ''}pdfs/`;
      const dirInfo = await FileSystem.getInfoAsync(documentsDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
        return;
      }

      const files = await FileSystem.readDirectoryAsync(documentsDir);
      const pdfFiles = files.filter(f => f.endsWith('.pdf'));

      const pdfs = await Promise.all(
        pdfFiles.map(async (filename): Promise<PDFDocument> => {
          const uri = `${documentsDir}${filename}`;
          const info = await FileSystem.getInfoAsync(uri);

          // Check for thumbnail file (backward compatibility)
          const baseFilename = filename.replace('.pdf', '');
          const thumbnailUri = `${documentsDir}${baseFilename}_thumb.jpg`;
          const thumbnailInfo = await FileSystem.getInfoAsync(thumbnailUri);
          const thumbnail = thumbnailInfo.exists ? thumbnailUri : null;

          // Check for page thumbnails (new multi-page format)
          const pageThumbnails: string[] = [];
          let pageNum = 1;
          while (true) {
            const pageThumbUri = `${documentsDir}${baseFilename}_page${pageNum}_thumb.jpg`;
            const pageThumbInfo = await FileSystem.getInfoAsync(pageThumbUri);
            if (pageThumbInfo.exists) {
              pageThumbnails.push(pageThumbUri);
              pageNum++;
            } else {
              break;
            }
          }

          return {
            id: baseFilename,
            name: baseFilename,
            uri,
            size: info.exists && 'size' in info ? info.size : 0,
            createdAt: info.exists && 'modificationTime' in info ? info.modificationTime * 1000 : Date.now(),
            thumbnail,
            pageThumbnails: pageThumbnails.length > 0 ? pageThumbnails : undefined,
          };
        })
      );

      set({ savedPDFs: pdfs.sort((a, b) => b.createdAt - a.createdAt) });
    } catch (error) {
      console.error('Error loading PDFs:', error);
    }
  },

  // Settings actions
  updateSettings: (newSettings: Partial<AppSettings>) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
}));

export default useDocumentStore;
