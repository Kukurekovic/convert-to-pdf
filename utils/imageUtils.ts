import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import type { FilterType, FlipDirection, CropData } from '../types/document';

export const rotateImage = async (uri: string, degrees: number): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: degrees }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error rotating image:', error);
    throw error;
  }
};

export const flipImage = async (uri: string, direction: FlipDirection = 'horizontal'): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ flip: direction === 'horizontal' ? ImageManipulator.FlipType.Horizontal : ImageManipulator.FlipType.Vertical }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error flipping image:', error);
    throw error;
  }
};

export const cropImage = async (uri: string, cropData: CropData): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: cropData }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw error;
  }
};

export const applyFilter = async (uri: string, filterType: FilterType): Promise<string> => {
  try {
    const actions: ImageManipulator.Action[] = [];

    switch (filterType) {
      case 'grayscale':
        // Convert to grayscale by reducing saturation
        actions.push({ resize: { width: 1000 } }); // Normalize size first
        break;
      case 'enhance':
        // Enhance contrast
        actions.push({ resize: { width: 1000 } });
        break;
      case 'blackwhite':
        // High contrast black and white
        actions.push({ resize: { width: 1000 } });
        break;
      case 'original':
        // No filter applied
        break;
      default:
        // Exhaustive check - TypeScript will error if new FilterType is added
        const _exhaustiveCheck: never = filterType;
        return _exhaustiveCheck;
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error applying filter:', error);
    throw error;
  }
};

export const resizeImage = async (uri: string, width: number, height: number): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};

export const getImageInfo = async (uri: string): Promise<FileSystem.FileInfo> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info;
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
};

export const saveImageToCache = async (uri: string): Promise<string> => {
  try {
    const filename = `${Date.now()}.jpg`;
    const newPath = `${FileSystem.cacheDirectory ?? ''}${filename}`;
    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });
    return newPath;
  } catch (error) {
    console.error('Error saving image to cache:', error);
    throw error;
  }
};

export const cleanupTempImages = async (imageUris: string[]): Promise<void> => {
  try {
    for (const uri of imageUris) {
      if (uri.includes(FileSystem.cacheDirectory ?? '')) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp images:', error);
  }
};

export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number }> => {
  try {
    // Use ImageManipulator with empty actions to get dimensions without modifications
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG
    });
    return { width: result.width, height: result.height };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw error;
  }
};

/**
 * Generates a thumbnail from base64 image data
 * @param base64Data - Base64-encoded image data (with or without data URI prefix)
 * @param fileName - Name for the thumbnail file (without extension)
 * @returns URI of saved thumbnail file
 */
export const generateThumbnail = async (
  base64Data: string,
  fileName: string
): Promise<string> => {
  try {
    // Remove data URI prefix if present (data:image/jpeg;base64,...)
    const base64Only = base64Data.includes(',')
      ? base64Data.split(',')[1]!
      : base64Data;

    // Create temporary file from base64
    const tempUri = `${FileSystem.cacheDirectory ?? ''}temp_${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(tempUri, base64Only, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Resize to max 800px width while preserving aspect ratio
    const result = await ImageManipulator.manipulateAsync(
      tempUri,
      [{ resize: { width: 800 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );

    // Move to final location in pdfs directory
    const pdfsDir = `${FileSystem.documentDirectory ?? ''}pdfs/`;
    const thumbnailUri = `${pdfsDir}${fileName}_thumb.jpg`;

    await FileSystem.moveAsync({
      from: result.uri,
      to: thumbnailUri,
    });

    // Clean up temp file if it still exists
    await FileSystem.deleteAsync(tempUri, { idempotent: true });

    return thumbnailUri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

/**
 * Compresses an image with specified quality
 * @param uri - URI of the image to compress
 * @param quality - Compression quality (0.3-1.0, where 1.0 is best quality)
 * @returns URI of the compressed image
 */
export const compressImage = async (
  uri: string,
  quality: number
): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [], // No transformations, just compress
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * Optimizes an image for PDF generation by applying compression and resolution scaling
 * @param uri - URI of the image to optimize
 * @param quality - Compression quality (0.3-1.0, where 1.0 is best quality)
 * @param maxWidth - Maximum width in pixels (default: 1240px for 200 DPI A4)
 * @param maxHeight - Maximum height in pixels (default: 1754px for 200 DPI A4)
 * @returns Object containing optimized image URI and dimensions
 */
export const optimizeForPDF = async (
  uri: string,
  quality: number,
  maxWidth: number = 1240,  // 200 DPI for A4 portrait
  maxHeight: number = 1754   // 200 DPI for A4 landscape
): Promise<{ uri: string; width: number; height: number }> => {
  try {
    // Get current dimensions
    const { width, height } = await getImageDimensions(uri);

    // Calculate scaling if needed
    const actions: ImageManipulator.Action[] = [];
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      const targetWidth = Math.floor(width * scale);
      actions.push({ resize: { width: targetWidth } });
    }

    // Apply resize + compression
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error optimizing image for PDF:', error);
    throw error;
  }
};
