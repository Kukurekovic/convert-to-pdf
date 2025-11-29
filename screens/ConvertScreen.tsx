import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import useDocumentStore from '../store/useDocumentStore';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import CameraView from '../components/CameraView';
import ImageEditor from '../components/ImageEditor';
import PDFPreview from '../components/PDFPreview';
import type { ConvertScreenProps } from '../types/navigation';
import type { ImageAsset } from '../types/document';
import { getImageDimensions } from '../utils/imageUtils';

export default function ConvertScreen({}: ConvertScreenProps) {
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const images = useDocumentStore((state) => state.images);
  const addImage = useDocumentStore((state) => state.addImage);
  const updateImage = useDocumentStore((state) => state.updateImage);
  const clearImages = useDocumentStore((state) => state.clearImages);

  const handleCameraPress = (): void => {
    setShowCamera(true);
  };

  const handleCameraCapture = (photo: ImageAsset): void => {
    setShowCamera(false);
    addImage(photo);
  };

  const handleGalleryPress = async (): Promise<void> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        result.assets.forEach(asset => {
          addImage({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          });
        });
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images from gallery');
    }
  };

  const handleScanDocument = async (): Promise<void> => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 10,
        letUserAdjustCrop: true,
      });

      if (scannedImages && scannedImages.length > 0) {
        // Process images sequentially to populate dimensions
        for (const uri of scannedImages) {
          try {
            const dimensions = await getImageDimensions(uri);
            addImage({
              uri,
              width: dimensions.width,
              height: dimensions.height
            });
          } catch (error) {
            console.error('Failed to get dimensions for scanned image:', error);
            // Add image without dimensions - PDF generation will handle fallback
            addImage({ uri });
          }
        }
      }
    } catch (error: any) {
      console.error('Error scanning document:', error);
      if (error.message !== 'User cancelled') {
        Alert.alert('Error', 'Failed to scan document');
      }
    }
  };

  const handleEditImage = (index: number): void => {
    setSelectedImageIndex(index);
    setShowEditor(true);
  };

  const handleSaveEdit = (updatedImage: ImageAsset): void => {
    updateImage(selectedImageIndex, updatedImage);
    setShowEditor(false);
  };

  const handleGeneratePDF = (): void => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please add at least one image to generate a PDF');
      return;
    }
    setShowPreview(true);
  };

  const handleClosePreview = (): void => {
    setShowPreview(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Convert to PDF</Text>
        <Text style={styles.subtitle}>Choose a source to scan or select images</Text>

        {images.length > 0 && (
          <View style={styles.imagesPreview}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{images.length} image{images.length > 1 ? 's' : ''} selected</Text>
              <TouchableOpacity onPress={clearImages}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
              {images.map((img, index) => (
                <TouchableOpacity key={index} onPress={() => handleEditImage(index)} style={styles.previewImage}>
                  <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                  <View style={styles.imageNumber}>
                    <Text style={styles.imageNumberText}>{index + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePDF}>
              <Text style={styles.generateButtonText}>Generate PDF</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleCameraPress}
            >
              <Text style={styles.buttonIcon}>📷</Text>
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#a855f7' }]}
              onPress={handleGalleryPress}
            >
              <Text style={styles.buttonIcon}>🖼️</Text>
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#22c55e' }]}
              onPress={handleScanDocument}
            >
              <Text style={styles.buttonIcon}>📄</Text>
              <Text style={styles.buttonText}>Scan Doc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#06b6d4', opacity: 0.5 }]}
              disabled
            >
              <Text style={styles.buttonIcon}>☁️</Text>
              <Text style={styles.buttonText}>iCloud</Text>
              <Text style={styles.comingSoon}>Coming Soon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={showCamera} animationType="slide" presentationStyle="fullScreen">
        <CameraView
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      </Modal>

      <Modal visible={showEditor} animationType="slide" presentationStyle="fullScreen">
        {showEditor && images[selectedImageIndex] && (
          <ImageEditor
            image={images[selectedImageIndex]!}
            onSave={handleSaveEdit}
            onCancel={() => setShowEditor(false)}
          />
        )}
      </Modal>

      <Modal visible={showPreview} animationType="slide" presentationStyle="fullScreen">
        {showPreview && (
          <PDFPreview
            images={images}
            onClose={handleClosePreview}
            onEdit={handleEditImage}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: RS(24),
    paddingVertical: RS(32),
  },
  title: {
    fontSize: RF(30),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: RS(8),
  },
  subtitle: {
    fontSize: RF(16),
    color: theme.colors.textLight,
    marginBottom: RS(16),
  },
  imagesPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: RS(12),
    marginBottom: RS(16),
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RS(12),
  },
  previewTitle: {
    fontSize: RF(14),
    fontWeight: '600',
    color: theme.colors.text,
  },
  clearText: {
    fontSize: RF(14),
    color: theme.colors.danger,
    fontWeight: '600',
  },
  previewScroll: {
    marginBottom: RS(12),
  },
  previewImage: {
    marginRight: RS(8),
    position: 'relative',
  },
  thumbnail: {
    width: RS(80),
    height: RS(100),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.border,
  },
  imageNumber: {
    position: 'absolute',
    bottom: RS(4),
    right: RS(4),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: RS(2),
    paddingHorizontal: RS(6),
    borderRadius: theme.radius.sm,
  },
  imageNumberText: {
    fontSize: RF(10),
    color: theme.colors.white,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: RS(12),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: RF(16),
    fontWeight: '700',
    color: theme.colors.white,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: RS(16),
  },
  button: {
    flex: 1,
    height: RS(120),
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: RS(8),
    ...theme.shadows.md,
  },
  buttonIcon: {
    fontSize: RF(32),
    marginBottom: RS(8),
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: RF(18),
    fontWeight: '600',
  },
  comingSoon: {
    fontSize: RF(10),
    color: theme.colors.white,
    marginTop: RS(4),
  },
});
