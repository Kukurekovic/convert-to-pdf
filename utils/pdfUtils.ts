import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { ImageAsset, PDFDocument, PDFGenerationOptions } from '../types/document';

export const generatePDF = async (
  images: ImageAsset[],
  options: PDFGenerationOptions = {}
): Promise<PDFDocument> => {
  try {
    const {
      fileName = `document_${Date.now()}`,
    } = options;

    // Convert images to base64 for embedding in HTML
    const imageDataPromises = images.map(async (img) => {
      try {
        const base64 = await FileSystem.readAsStringAsync(img.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/jpeg;base64,${base64}`;
      } catch (error) {
        console.error('Error reading image:', error);
        return '';
      }
    });

    const imageData = await Promise.all(imageDataPromises);

    // Create HTML content with base64 images
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
            }
            .page {
              page-break-after: always;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100vh;
            }
            .page:last-child {
              page-break-after: auto;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          ${imageData.map(data => `
            <div class="page">
              <img src="${data}" alt="Document Page" />
            </div>
          `).join('')}
        </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
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
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString();
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};
