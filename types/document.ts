export interface ImageAsset {
  uri: string;
  width?: number;
  height?: number;
}

export interface PDFDocument {
  id: string;
  name: string;
  uri: string;
  size: number;
  createdAt: number;
  pageCount?: number;
  thumbnail?: string | null; // First page thumbnail (backward compatibility)
  pageThumbnails?: string[]; // Array of all page thumbnails
}

export type PDFQuality = 'low' | 'medium' | 'high';

export interface PDFGenerationOptions {
  fileName?: string;
  quality?: PDFQuality;
}

export type FilterType = 'grayscale' | 'enhance' | 'blackwhite' | 'original';
export type FlipDirection = 'horizontal' | 'vertical';

export interface CropData {
  originX: number;
  originY: number;
  width: number;
  height: number;
}
