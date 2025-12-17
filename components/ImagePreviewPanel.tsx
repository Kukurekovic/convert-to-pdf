import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { ImageAsset } from '../types/document';
import { getImageDimensions } from '../utils/imageUtils';
import i18n from '../i18n';

interface ImagePreviewPanelProps {
  visible: boolean;
  images: ImageAsset[];
  onClose: () => void;
  onGeneratePDF: (filename: string, quality: number) => void;
  onAddImages: (newImages: ImageAsset[]) => void;
  onEditImage: (index: number) => void;
}

type QualityOption = {
  label: string;
  value: number;
};

const qualityOptions: QualityOption[] = [
  { label: 'Low', value: 0.3 },
  { label: 'Medium', value: 0.6 },
  { label: 'High', value: 1.0 },
];

export default function ImagePreviewPanel({
  visible,
  images,
  onClose,
  onGeneratePDF,
  onAddImages,
  onEditImage,
}: ImagePreviewPanelProps) {
  const [slideAnim] = useState(new Animated.Value(1));
  const [filename, setFilename] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<number>(0.6); // Default to Medium quality
  const [previousVisible, setPreviousVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    // Generate default filename only when panel transitions from hidden to visible
    if (visible && !previousVisible) {
      const now = new Date();
      const defaultName = `Doc ${now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} ${now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(/:/g, '-')}`;
      setFilename(defaultName);
    }
    setPreviousVisible(visible);
  }, [visible, previousVisible]);

  const handleClose = (): void => {
    Alert.alert(
      i18n.t('components.imagePreview.alerts.discardScan'),
      i18n.t('components.imagePreview.alerts.discardScanMessage'),
      [
        {
          text: i18n.t('common.cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('components.imagePreview.alerts.discard'),
          style: 'destructive',
          onPress: () => {
            Animated.timing(slideAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              onClose();
              setFilename('');
            });
          },
        },
      ],
    );
  };

  const handleGeneratePDF = (): void => {
    if (images.length === 0) {
      Alert.alert(i18n.t('components.imagePreview.alerts.noImages'), i18n.t('components.imagePreview.alerts.noImagesMessage'));
      return;
    }
    if (!filename.trim()) {
      Alert.alert(i18n.t('components.imagePreview.alerts.noFilename'), i18n.t('components.imagePreview.alerts.noFilenameMessage'));
      return;
    }
    onGeneratePDF(filename.trim(), selectedQuality);
  };

  const handleScanDocument = async (): Promise<void> => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 10,
        letUserAdjustCrop: true,
      });

      if (scannedImages && scannedImages.length > 0) {
        const newImages: ImageAsset[] = [];
        for (const uri of scannedImages) {
          try {
            const dimensions = await getImageDimensions(uri);
            newImages.push({
              uri,
              width: dimensions.width,
              height: dimensions.height,
            });
          } catch (error) {
            console.error('Failed to get dimensions for scanned image:', error);
            newImages.push({ uri });
          }
        }
        onAddImages(newImages);
      }
    } catch (error: any) {
      console.error('Error scanning document:', error);
      if (error.message !== 'User cancelled') {
        Alert.alert(i18n.t('common.error'), i18n.t('components.imagePreview.alerts.failedToScan'));
      }
    }
  };

  const handleGalleryPress = async (): Promise<void> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(i18n.t('components.imagePreview.alerts.permissionRequired'), i18n.t('components.imagePreview.alerts.permissionMessage'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const newImages: ImageAsset[] = result.assets.map(asset => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        }));
        onAddImages(newImages);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('components.imagePreview.alerts.failedToPickImages'));
    }
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent={false}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['right', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                <Text style={styles.backButtonText}>{i18n.t('components.imagePreview.backButton')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{i18n.t('components.imagePreview.title')}</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Document Name Input */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{i18n.t('components.imagePreview.documentName')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={filename}
                  onChangeText={setFilename}
                  placeholder={i18n.t('components.imagePreview.documentNamePlaceholder')}
                  placeholderTextColor={theme.colors.textLight}
                />
              </View>

              {/* PDF Quality Selector */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{i18n.t('components.imagePreview.pdfQuality')}</Text>
                <View style={styles.qualityContainer}>
                  {qualityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.qualityButton,
                        selectedQuality === option.value && styles.qualityButtonActive,
                      ]}
                      onPress={() => setSelectedQuality(option.value)}
                    >
                      <Text
                        style={[
                          styles.qualityButtonText,
                          selectedQuality === option.value && styles.qualityButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Image Preview */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {i18n.t('components.imagePreview.imageCount', { count: images.length, defaultValue: `${images.length} image` })} {i18n.t('common.selected')}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
                  {images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => onEditImage(index)}
                      style={styles.previewImage}
                    >
                      <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                      <View style={styles.imageNumber}>
                        <Text style={styles.imageNumberText}>{index + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Add More Images */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{i18n.t('components.imagePreview.addMoreImages')}</Text>
                <View style={styles.addImageButtons}>
                  <View style={styles.buttonWrapper}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleGalleryPress}
                    >
                      <MaterialIcons name="collections" size={RS(32)} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.buttonText}>{i18n.t('components.imagePreview.buttons.gallery')}</Text>
                  </View>

                  <View style={styles.buttonWrapper}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleScanDocument}
                    >
                      <MaterialIcons name="camera-alt" size={RS(32)} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.buttonText}>{i18n.t('components.imagePreview.buttons.camera')}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Generate PDF Button */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePDF}>
                <Text style={styles.generateButtonText}>{i18n.t('components.imagePreview.generatePDF')}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  panel: {
    width: '100%',
    backgroundColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RS(20),
    paddingTop: RS(56),
    paddingBottom: RS(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    paddingVertical: RS(4),
    paddingHorizontal: RS(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: RF(16),
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
  },
  headerTitle: {
    fontSize: RF(20),
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'Urbanist_700Bold',
  },
  headerSpacer: {
    width: RS(32),
  },
  content: {
    flex: 1,
    paddingHorizontal: RS(20),
  },
  section: {
    marginTop: RS(24),
  },
  sectionLabel: {
    fontSize: RF(14),
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: RS(12),
    fontFamily: 'Urbanist_600SemiBold',
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    fontSize: RF(16),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: 'Urbanist_400Regular',
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityButton: {
    flex: 1,
    paddingVertical: RS(10),
    marginHorizontal: RS(4),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  qualityButtonText: {
    fontSize: RF(12),
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Urbanist_600SemiBold',
  },
  qualityButtonTextActive: {
    color: theme.colors.white,
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
    fontFamily: 'Urbanist_600SemiBold',
  },
  addImageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: RS(8),
    minHeight: RS(100),
  },
  button: {
    width: RS(70),
    height: RS(70),
    borderRadius: RS(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: RS(8),
    flexShrink: 0,
    ...theme.shadows.md,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: RF(13),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Urbanist_600SemiBold',
  },
  footer: {
    paddingHorizontal: RS(20),
    paddingVertical: RS(16),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: RS(16),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: RF(18),
    fontWeight: '700',
    color: theme.colors.white,
    fontFamily: 'Urbanist_700Bold',
  },
});
