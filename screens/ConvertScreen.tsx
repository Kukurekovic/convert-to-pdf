import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

export default function ConvertScreen({ navigation }: ConvertScreenProps) {
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [pdfQuality, setPdfQuality] = useState<number>(0.6);
  const [showURLModal, setShowURLModal] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');

  const images = useDocumentStore((state) => state.images);
  const addImage = useDocumentStore((state) => state.addImage);
  const updateImage = useDocumentStore((state) => state.updateImage);

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
    setUrlInput('');
    setShowURLModal(true);
  };

  const handleDownloadFromURL = async (): Promise<void> => {
    const url = urlInput.trim();

    if (!url) {
      Alert.alert('Invalid Input', 'Please enter a valid URL');
      return;
    }

    // Validate URL format
    if (!url.match(/^https?:\/\/.+/i)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    setShowURLModal(false);

    try {
      // Download the image to cache directory
      const downloadedFile = await File.downloadFileAsync(url, Paths.cache);

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
      Alert.alert('Error', 'Failed to download image. Please check the URL and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Convert to PDF</Text>
        </View>

        <View style={styles.topSpacer} />

        <View style={styles.buttonContainer}>
          <View style={styles.row}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleGalleryPress}
              >
                <Ionicons name="images-outline" size={RS(48)} color={theme.colors.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.buttonText}>Gallery</Text>
            </View>

            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleScanDocument}
              >
                <Ionicons name="camera-outline" size={RS(48)} color={theme.colors.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.buttonText}>Camera</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleFilesPress}
              >
                <Ionicons name="folder-open-outline" size={RS(48)} color={theme.colors.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.buttonText}>Files</Text>
            </View>

            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleURLPress}
              >
                <Ionicons name="link-outline" size={RS(48)} color={theme.colors.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.buttonText}>URL Link</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
            navigation={navigation}
          />
        )}
      </Modal>

      <Modal
        visible={showURLModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowURLModal(false)}
      >
        <View style={styles.urlModalOverlay}>
          <View style={styles.urlModalContent}>
            <Text style={styles.urlModalTitle}>Enter Image URL</Text>
            <Text style={styles.urlModalSubtitle}>
              Please enter the URL of the image you want to download
            </Text>

            <TextInput
              style={styles.urlInput}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={theme.colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus
            />

            <View style={styles.urlModalButtons}>
              <TouchableOpacity
                style={[styles.urlModalButton, styles.urlModalButtonCancel]}
                onPress={() => setShowURLModal(false)}
              >
                <Text style={styles.urlModalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.urlModalButton, styles.urlModalButtonDownload]}
                onPress={handleDownloadFromURL}
              >
                <Text style={styles.urlModalButtonTextDownload}>Download</Text>
              </TouchableOpacity>
            </View>
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
  titleContainer: {
    alignItems: 'center',
    paddingBottom: RS(56),
  },
  title: {
    fontSize: RF(28),
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
    marginBottom: RS(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RF(16),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.textLight,
    marginBottom: RS(16),
  },
  topSpacer: {
    flex: 0.5,
  },
  bottomSpacer: {
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: RS(32),
  },
  buttonWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: RS(8),
    minHeight: RS(150),
  },
  button: {
    width: RS(95),
    height: RS(95),
    borderRadius: RS(60),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2350e0',
    marginBottom: RS(8),
    flexShrink: 0,
    ...theme.shadows.md,
  },
  icon: {
    marginBottom: RS(8),
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: RF(18),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: RF(10),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.text,
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
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
    marginBottom: RS(8),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: RF(15),
    fontFamily: 'Urbanist_400Regular',
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
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
    marginRight: RS(8),
    width: RS(20),
  },
  instructionText: {
    flex: 1,
    fontSize: RF(15),
    fontFamily: 'Urbanist_400Regular',
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
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.white,
  },
  urlModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RS(24),
  },
  urlModalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: RS(24),
    width: '100%',
    maxWidth: RS(400),
  },
  urlModalTitle: {
    fontSize: RF(22),
    fontWeight: 'bold',
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
    marginBottom: RS(8),
    textAlign: 'center',
  },
  urlModalSubtitle: {
    fontSize: RF(15),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.textLight,
    marginBottom: RS(20),
    textAlign: 'center',
  },
  urlInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    fontSize: RF(16),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.text,
    marginBottom: RS(20),
  },
  urlModalButtons: {
    flexDirection: 'row',
    gap: RS(12),
  },
  urlModalButton: {
    flex: 1,
    paddingVertical: RS(14),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  urlModalButtonCancel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  urlModalButtonDownload: {
    backgroundColor: theme.colors.primary,
  },
  urlModalButtonTextCancel: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
  },
  urlModalButtonTextDownload: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.white,
  },
});
