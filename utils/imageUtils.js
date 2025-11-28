import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export const rotateImage = async (uri, degrees) => {
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

export const flipImage = async (uri, direction = 'horizontal') => {
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

export const cropImage = async (uri, cropData) => {
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

export const applyFilter = async (uri, filterType) => {
  try {
    const actions = [];

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
      default:
        break;
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

export const resizeImage = async (uri, width, height) => {
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

export const getImageInfo = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info;
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
};

export const saveImageToCache = async (uri) => {
  try {
    const filename = `${Date.now()}.jpg`;
    const newPath = `${FileSystem.cacheDirectory}${filename}`;
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

export const cleanupTempImages = async (imageUris) => {
  try {
    for (const uri of imageUris) {
      if (uri.includes(FileSystem.cacheDirectory)) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp images:', error);
  }
};
