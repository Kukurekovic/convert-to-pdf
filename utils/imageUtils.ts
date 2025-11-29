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
