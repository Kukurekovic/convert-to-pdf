import type { ImageAsset, PDFDocument, PDFQuality } from './document';

export interface AppSettings {
  autoEnhance: boolean;
  defaultQuality: PDFQuality;
  showTutorial: boolean;
}

export interface DocumentStoreState {
  images: ImageAsset[];
  currentImageIndex: number;
  savedPDFs: PDFDocument[];
  settings: AppSettings;

  addImage: (image: ImageAsset) => void;
  removeImage: (index: number) => void;
  updateImage: (index: number, updatedImage: ImageAsset) => void;
  clearImages: () => void;
  setCurrentImageIndex: (index: number) => void;

  addPDF: (pdf: PDFDocument) => void;
  removePDF: (id: string) => Promise<void>;
  clearAllPDFs: () => Promise<void>;
  loadPDFs: () => Promise<void>;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
}
