import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { ImageAsset, PDFDocument, PDFGenerationOptions } from '../types/document';
import { getImageDimensions } from './imageUtils';

interface ImageWithOrientation {
  base64Data: string;
  orientation: 'portrait' | 'landscape';
}

const detectOrientation = (width: number, height: number): 'portrait' | 'landscape' => {
  return width > height ? 'landscape' : 'portrait';
};

const getImageOrientation = async (
  image: ImageAsset
): Promise<ImageWithOrientation> => {
  // Get dimensions from metadata or fetch them
  let width = image.width;
  let height = image.height;

  // Fallback dimension detection for images without metadata
  if (!width || !height) {
    try {
      const dimensions = await getImageDimensions(image.uri);
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      console.warn('Failed to get image dimensions, defaulting to portrait', error);
      // Default to portrait A4 aspect ratio (210mm × 297mm)
      width = 595;
      height = 842;
    }
  }

  // Safety check for invalid dimensions
  if (!width || !height || width <= 0 || height <= 0) {
    console.warn('Invalid dimensions detected, using default portrait');
    width = 595;
    height = 842;
  }

  // Convert image to base64
  try {
    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      base64Data: `data:image/jpeg;base64,${base64}`,
      orientation: detectOrientation(width, height),
    };
  } catch (error) {
    console.error('Error reading image file:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const generateDefaultFileName = (): string => {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `Doc ${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
};

export const generatePDF = async (
  images: ImageAsset[],
  options: PDFGenerationOptions = {}
): Promise<PDFDocument> => {
  try {
    const {
      fileName = generateDefaultFileName(),
    } = options;

    // Process all images with orientation detection
    const processedImages = await Promise.all(
      images.map(img => getImageOrientation(img))
    );

    // A4 dimensions at 72 DPI (points): 595px × 842px (8.27" × 11.69")
    const A4_PORTRAIT_WIDTH = 595;
    const A4_PORTRAIT_HEIGHT = 842;
    const A4_LANDSCAPE_WIDTH = 842;
    const A4_LANDSCAPE_HEIGHT = 595;

    // Create HTML content with orientation-specific pages
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Global reset */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            /* Base page settings - portrait A4 by default */
            @page {
              margin: 0;
              padding: 0;
              size: ${A4_PORTRAIT_WIDTH}px ${A4_PORTRAIT_HEIGHT}px;
            }

            /* Portrait page specification */
            @page portrait {
              size: ${A4_PORTRAIT_WIDTH}px ${A4_PORTRAIT_HEIGHT}px;
            }

            /* Landscape page specification */
            @page landscape {
              size: ${A4_LANDSCAPE_WIDTH}px ${A4_LANDSCAPE_HEIGHT}px;
            }

            html, body {
              width: 100%;
              height: 100%;
            }

            /* Portrait page container */
            .page-portrait {
              page: portrait;
              page-break-after: always;
              width: ${A4_PORTRAIT_WIDTH}px;
              height: ${A4_PORTRAIT_HEIGHT}px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
            }

            /* Landscape page container */
            .page-landscape {
              page: landscape;
              page-break-after: always;
              width: ${A4_LANDSCAPE_WIDTH}px;
              height: ${A4_LANDSCAPE_HEIGHT}px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
            }

            /* Remove page break from last page */
            .page-portrait:last-child,
            .page-landscape:last-child {
              page-break-after: auto;
            }

            /* Image fitting - contain preserves aspect ratio without cropping */
            img {
              max-width: 100%;
              max-height: 100%;
              width: auto;
              height: auto;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          ${processedImages.map((img, index) => `
            <div class="page-${img.orientation}">
              <img src="${img.base64Data}" alt="Page ${index + 1}" />
            </div>
          `).join('')}
        </body>
      </html>
    `;

    // Generate PDF with A4 portrait as default page size
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: A4_PORTRAIT_WIDTH,
      height: A4_PORTRAIT_HEIGHT,
    });

    // Create PDFs directory if it doesn't exist
    const pdfsDir = `${FileSystem.documentDirectory}pdfs/`;
    const dirInfo = await FileSystem.getInfoAsync(pdfsDir);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(pdfsDir, { intermediates: true });
    }

    // Move PDF to permanent location
    const finalUri = `${pdfsDir}${fileName}.pdf`;
    await FileSystem.moveAsync({
      from: uri,
      to: finalUri,
    });

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(finalUri);

    return {
      id: fileName,
      name: fileName,
      uri: finalUri,
      size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      createdAt: Date.now(),
      pageCount: images.length,
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const sharePDF = async (uri: string): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PDF',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};

export const deletePDF = async (uri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
};

export const getPDFInfo = async (uri: string): Promise<FileSystem.FileInfo> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info;
  } catch (error) {
    console.error('Error getting PDF info:', error);
    throw error;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]!;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};
