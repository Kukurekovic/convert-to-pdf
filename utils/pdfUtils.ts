import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { ImageAsset, PDFDocument, PDFGenerationOptions } from '../types/document';
import { generateThumbnail, optimizeForPDF } from './imageUtils';

interface ImageWithOrientation {
  base64Data: string;
  orientation: 'portrait' | 'landscape';
}

const detectOrientation = (width: number, height: number): 'portrait' | 'landscape' => {
  return width > height ? 'landscape' : 'portrait';
};

/**
 * Sanitizes a filename to be cross-platform compatible (iOS + Android)
 * Replaces invalid characters with safe alternatives
 * Preserves spaces in filenames (safe on modern iOS/Android)
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[/:]/g, '-')        // Replace colons and slashes with hyphens
    .replace(/[<>"|?*]/g, '_')    // Replace other invalid chars with underscores
    .trim();
};

const getImageOrientation = async (
  image: ImageAsset,
  quality: number = 0.6  // Default to Medium quality
): Promise<ImageWithOrientation> => {
  try {
    // Optimize image (compress + downscale)
    const optimized = await optimizeForPDF(
      image.uri,
      quality,
      1240,  // 200 DPI for A4 portrait (595px @ 72 DPI * 2.08)
      1754   // 200 DPI for A4 landscape
    );

    // Read optimized image as base64
    const base64 = await FileSystem.readAsStringAsync(optimized.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      base64Data: `data:image/jpeg;base64,${base64}`,
      orientation: detectOrientation(optimized.width, optimized.height),
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const generateDefaultFileName = (): string => {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const day = now.getDate();
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `Doc ${month} ${day}, ${year} ${hours}-${minutes}-${seconds}`;
};

export const generatePDF = async (
  images: ImageAsset[],
  options: PDFGenerationOptions = {}
): Promise<PDFDocument> => {
  try {
    const {
      fileName = generateDefaultFileName(),
      quality: qualityOption,
    } = options;

    // Sanitize the filename to ensure cross-platform compatibility
    const sanitizedFileName = sanitizeFileName(fileName);

    // Convert quality option to numeric value (default to 0.6 = Medium)
    const quality = typeof qualityOption === 'number' ? qualityOption
                  : qualityOption === 'low' ? 0.3
                  : qualityOption === 'high' ? 0.8
                  : qualityOption === 'best' ? 1.0
                  : 0.6; // medium (default)

    // Process all images with compression and orientation detection
    const processedImages = await Promise.all(
      images.map(img => getImageOrientation(img, quality))
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
    const finalUri = `${pdfsDir}${sanitizedFileName}.pdf`;
    await FileSystem.moveAsync({
      from: uri,
      to: finalUri,
    });

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(finalUri);

    // Generate thumbnails for all pages
    let thumbnailUri: string | null = null;
    const pageThumbnails: string[] = [];

    try {
      for (let i = 0; i < processedImages.length; i++) {
        const img = processedImages[i];
        if (img) {
          const pageFileName = `${sanitizedFileName}_page${i + 1}`;
          const pageThumbUri = await generateThumbnail(
            img.base64Data,
            pageFileName
          );
          pageThumbnails.push(pageThumbUri);

          // Keep first page as main thumbnail for backward compatibility
          if (i === 0) {
            thumbnailUri = pageThumbUri;
          }
        }
      }
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      // Don't fail PDF generation if thumbnail creation fails
    }

    return {
      id: sanitizedFileName,
      name: sanitizedFileName,
      uri: finalUri,
      size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      createdAt: Date.now(),
      pageCount: images.length,
      thumbnail: thumbnailUri,
      pageThumbnails: pageThumbnails.length > 0 ? pageThumbnails : undefined,
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
