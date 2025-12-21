import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import { generatePDF } from '../utils/pdfUtils';
import useDocumentStore from '../store/useDocumentStore';
import type { ImageAsset } from '../types/document';
import type { NavigationProp } from '@react-navigation/native';
import type { RootTabParamList } from '../types/navigation';
import i18n from '../i18n';
// @ts-ignore - Paywall module has internal TS errors but works at runtime
import { usePaywallGate, usePaywallVisibility } from '../paywall-module';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_WIDTH = (SCREEN_WIDTH - RS(48)) / 3;

interface PDFPreviewProps {
  images: ImageAsset[];
  onClose: () => void;
  onEdit: (index: number) => void;
  filename?: string;
  quality?: number;
  navigation?: NavigationProp<RootTabParamList>;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ images, onClose, onEdit, filename, quality = 0.6, navigation }) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const addPDF = useDocumentStore((state) => state.addPDF);
  const clearImages = useDocumentStore((state) => state.clearImages);

  // Paywall hooks
  const { isSubscriber, ensureGateBeforeStart } = usePaywallGate();

  // Map numeric quality to PDFQuality type
  const getQualityString = (numericQuality: number): 'low' | 'medium' | 'high' | 'best' => {
    if (numericQuality <= 0.3) return 'low';
    if (numericQuality <= 0.6) return 'medium';
    if (numericQuality <= 0.8) return 'high';
    return 'best';
  };

  const pdfQuality = getQualityString(quality);

  // Helper function to increment PDF conversion count for trial users
  const incrementPDFCount = async (): Promise<void> => {
    if (isSubscriber) return; // Subscribers don't need counting

    try {
      const countStr = await AsyncStorage.getItem('pdfConversionsCount');
      const timestampStr = await AsyncStorage.getItem('firstPdfConversionTime');
      const count = countStr ? parseInt(countStr, 10) : 0;

      // Set first conversion timestamp if not exists
      if (!timestampStr) {
        await AsyncStorage.setItem('firstPdfConversionTime', String(Date.now()));
      }

      // Increment counter
      await AsyncStorage.setItem('pdfConversionsCount', String(count + 1));

      console.log(`[PDF Counter] Total PDFs created: ${count + 1}/5 in trial`);
    } catch (error) {
      console.error('Failed to increment PDF count:', error);
    }
  };

  const handleSave = async (): Promise<void> => {
    // Check subscription/trial status before saving
    const canProceed = await ensureGateBeforeStart();

    if (!canProceed) {
      // Trial limit reached - paywall is already shown by ensureGateBeforeStart
      return;
    }

    setIsSaving(true);
    try {
      const pdf = await generatePDF(images, {
        fileName: filename,
        quality: pdfQuality,
      });

      addPDF(pdf);
      clearImages();

      // Increment PDF counter for trial users
      await incrementPDFCount();

      // Show toast notification
      Toast.show({
        type: 'pdfSaved',
        text1: 'PDF saved',
        visibilityTime: 2000,
        autoHide: true,
      });

      // Navigate immediately
      onClose();
      if (navigation) {
        navigation.navigate('HistoryStack');
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      Alert.alert(i18n.t('components.pdfPreview.alerts.error'), i18n.t('components.pdfPreview.alerts.saveError'));
    }
    setIsSaving(false);
  };

  const handleRemoveImage = (index: number): void => {
    Alert.alert(
      i18n.t('components.pdfPreview.alerts.removePage'),
      i18n.t('components.pdfPreview.alerts.removePageMessage'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('components.pdfPreview.buttons.remove'),
          style: 'destructive',
          onPress: () => {
            const removeImage = useDocumentStore.getState().removeImage;
            removeImage(index);
            if (images.length === 1) {
              onClose();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>{i18n.t('common.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('components.pdfPreview.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          {i18n.t('components.pdfPreview.pageCount', { count: images.length, defaultValue: `${images.length} page` })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.pagesGrid}>
          {images.map((image, index) => (
            <View key={index} style={styles.pageItem}>
              <TouchableOpacity
                onPress={() => onEdit(index)}
                style={styles.pageThumbnail}
              >
                <Image
                  source={{ uri: image.uri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                <View style={styles.pageNumber}>
                  <Text style={styles.pageNumberText}>{index + 1}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>{i18n.t('components.pdfPreview.buttons.savePDF')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: RS(50),
    paddingHorizontal: RS(16),
    paddingBottom: RS(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  headerButton: {
    paddingVertical: RS(8),
    paddingHorizontal: RS(12),
  },
  headerButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Urbanist_600SemiBold',
  },
  headerTitle: {
    fontSize: RF(18),
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'Urbanist_700Bold',
  },
  placeholder: {
    width: RS(60),
  },
  info: {
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    backgroundColor: theme.colors.surface,
  },
  infoText: {
    fontSize: RF(14),
    color: theme.colors.textLight,
    textAlign: 'center',
    fontFamily: 'Urbanist_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: RS(16),
  },
  pagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: RS(12),
  },
  pageItem: {
    width: THUMBNAIL_WIDTH,
    marginBottom: RS(12),
  },
  pageThumbnail: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_WIDTH * 1.4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  pageNumber: {
    position: 'absolute',
    bottom: RS(8),
    right: RS(8),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: RS(4),
    paddingHorizontal: RS(8),
    borderRadius: theme.radius.sm,
  },
  pageNumberText: {
    fontSize: RF(12),
    fontWeight: '600',
    color: theme.colors.white,
    fontFamily: 'Urbanist_600SemiBold',
  },
  removeButton: {
    position: 'absolute',
    top: RS(4),
    right: RS(4),
    width: RS(24),
    height: RS(24),
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: RF(16),
    color: theme.colors.white,
    fontWeight: '700',
    fontFamily: 'Urbanist_700Bold',
  },
  footer: {
    flexDirection: 'row',
    gap: RS(12),
    paddingHorizontal: RS(16),
    paddingVertical: RS(16),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: RS(16),
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: RF(16),
    fontWeight: '700',
    color: theme.colors.white,
    fontFamily: 'Urbanist_700Bold',
  },
});

export default PDFPreview;
