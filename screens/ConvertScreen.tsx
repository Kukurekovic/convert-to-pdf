import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import DocumentScanner from 'react-native-document-scanner-plugin';
import useDocumentStore from '../store/useDocumentStore';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import ImageEditor from '../components/ImageEditor';
import ImagePreviewPanel from '../components/ImagePreviewPanel';
import PDFPreview from '../components/PDFPreview';
import type { ConvertScreenProps } from '../types/navigation';
import type { ImageAsset } from '../types/document';
import { getImageDimensions } from '../utils/imageUtils';

export default function ConvertScreen({}: ConvertScreenProps) {
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState<boolean>(false);
  const [showOtherAppsModal, setShowOtherAppsModal] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [pdfQuality, setPdfQuality] = useState<number>(0.8);

  const images = useDocumentStore((state) => state.images);
  const addImage = useDocumentStore((state) => state.addImage);
  const updateImage = useDocumentStore((state) => state.updateImage);
  const clearImages = useDocumentStore((state) => state.clearImages);

  const handleFilesPress = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        for (const asset of result.assets) {
          try {
            const dimensions = await getImageDimensions(asset.uri);
            addImage({
              uri: asset.uri,
              width: dimensions.width,
              height: dimensions.height,
            });
          } catch (error) {
            console.error('Failed to get dimensions for file:', error);
            addImage({ uri: asset.uri });
          }
        }
        setShowPreviewPanel(true);
      }
    } catch (error) {
      console.error('Error picking files:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
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
        setShowPreviewPanel(true);
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
        setShowPreviewPanel(true);
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

  const handleGeneratePDF = (filename: string, quality: number): void => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please add at least one image to generate a PDF');
      return;
    }
    setPdfFilename(filename);
    setPdfQuality(quality);
    setShowPreviewPanel(false);
    setShowPreview(true);
  };

  const handleClosePreview = (): void => {
    setShowPreview(false);
  };

  const handleAddImages = (newImages: ImageAsset[]): void => {
    newImages.forEach(img => addImage(img));
  };

  const handleClosePanelAndClear = (): void => {
    setShowPreviewPanel(false);
  };

  const handleURLPress = (): void => {
    Alert.prompt(
      'Enter Image URL',
      'Please enter the URL of the image you want to download',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Download',
          onPress: async (url?: string) => {
            if (url && url.trim()) {
              try {
                const trimmedUrl = url.trim();

                // Validate URL format
                if (!trimmedUrl.match(/^https?:\/\/.+/i)) {
                  Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
                  return;
                }

                // Download the image to cache directory
                const downloadedFile = await File.downloadFileAsync(trimmedUrl, Paths.cache);

                try {
                  // Get image dimensions
                  const dimensions = await getImageDimensions(downloadedFile.uri);
                  addImage({
                    uri: downloadedFile.uri,
                    width: dimensions.width,
                    height: dimensions.height,
                  });
                  setShowPreviewPanel(true);
                  Alert.alert('Success', 'Image downloaded successfully');
                } catch (error) {
                  console.error('Failed to get dimensions for downloaded image:', error);
                  // Add image without dimensions as fallback
                  addImage({ uri: downloadedFile.uri });
                  setShowPreviewPanel(true);
                  Alert.alert('Success', 'Image downloaded successfully');
                }
              } catch (error) {
                console.error('Error downloading image from URL:', error);
                Alert.alert('Error', 'Failed to download the image. Please check the URL and try again.');
              }
            } else {
              Alert.alert('Invalid Input', 'Please enter a valid URL');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleCloudPress = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        for (const asset of result.assets) {
          try {
            const dimensions = await getImageDimensions(asset.uri);
            addImage({
              uri: asset.uri,
              width: dimensions.width,
              height: dimensions.height,
            });
          } catch (error) {
            console.error('Failed to get dimensions for cloud file:', error);
            addImage({ uri: asset.uri });
          }
        }
        setShowPreviewPanel(true);
      }
    } catch (error) {
      console.error('Error picking files from cloud:', error);
      Alert.alert('Error', 'Failed to pick files from cloud storage');
    }
  };

  const handleOtherAppsPress = (): void => {
    setShowOtherAppsModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Convert to PDF</Text>
        

        <View style={styles.buttonContainer}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleFilesPress}
            >
              <MaterialIcons name="folder" size={RS(48)} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Files</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#a855f7' }]}
              onPress={handleGalleryPress}
            >
              <MaterialIcons name="collections" size={RS(48)} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#22c55e' }]}
              onPress={handleScanDocument}
            >
              <MaterialIcons name="document-scanner" size={RS(48)} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Scan Doc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#06b6d4' }]}
              onPress={handleCloudPress}
            >
              <MaterialIcons name="cloud" size={RS(48)} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Cloud</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#f59e0b' }]}
              onPress={handleURLPress}
            >
              <MaterialIcons name="link" size={RS(48)} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>URL Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ef4444' }]}
              onPress={handleOtherAppsPress}
            >
              <MaterialIcons name="apps" size={RS(48)} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Other Apps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={showEditor} animationType="slide" presentationStyle="fullScreen">
        {showEditor && images[selectedImageIndex] && (
          <ImageEditor
            image={images[selectedImageIndex]!}
            onSave={handleSaveEdit}
            onCancel={() => setShowEditor(false)}
          />
        )}
      </Modal>

      <ImagePreviewPanel
        visible={showPreviewPanel}
        images={images}
        onClose={handleClosePanelAndClear}
        onGeneratePDF={handleGeneratePDF}
        onAddImages={handleAddImages}
        onClearImages={clearImages}
        onEditImage={handleEditImage}
      />

      <Modal visible={showPreview} animationType="slide" presentationStyle="fullScreen">
        {showPreview && (
          <PDFPreview
            images={images}
            onClose={handleClosePreview}
            onEdit={handleEditImage}
            filename={pdfFilename}
            quality={pdfQuality}
          />
        )}
      </Modal>

      <Modal visible={showOtherAppsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import from Other Apps</Text>
            <Text style={styles.modalSubtitle}>To import documents from other apps:</Text>

            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1.</Text>
                <Text style={styles.instructionText}>Open the app containing your document</Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2.</Text>
                <Text style={styles.instructionText}>Tap the share button</Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3.</Text>
                <Text style={styles.instructionText}>Select "Copy to PDF Converter"</Text>
              </View>

              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>4.</Text>
                <Text style={styles.instructionText}>Your document will appear in the app</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowOtherAppsModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RF(16),
    color: theme.colors.textLight,
    marginBottom: RS(16),
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
  icon: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RS(24),
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: RS(24),
    width: '100%',
    maxWidth: RS(400),
  },
  modalTitle: {
    fontSize: RF(22),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: RS(8),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: RF(15),
    color: theme.colors.textLight,
    marginBottom: RS(20),
  },
  instructionsList: {
    marginBottom: RS(24),
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: RS(12),
  },
  instructionNumber: {
    fontSize: RF(15),
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: RS(8),
    width: RS(20),
  },
  instructionText: {
    flex: 1,
    fontSize: RF(15),
    color: theme.colors.text,
    lineHeight: RF(22),
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: RS(14),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    color: theme.colors.white,
  },
});
