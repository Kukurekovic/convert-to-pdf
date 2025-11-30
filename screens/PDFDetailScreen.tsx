import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useDocumentStore from '../store/useDocumentStore';
import { sharePDF } from '../utils/pdfUtils';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { PDFDetailScreenProps } from '../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PDFDetailScreen({ route, navigation }: PDFDetailScreenProps) {
  const { pdfId } = route.params;
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const savedPDFs = useDocumentStore((state) => state.savedPDFs);
  const removePDF = useDocumentStore((state) => state.removePDF);

  const pdf = savedPDFs.find((p) => p.id === pdfId);

  useEffect(() => {
    if (!pdf) {
      Alert.alert('Error', 'PDF not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [pdf, navigation]);

  const handleShare = async (): Promise<void> => {
    if (!pdf) return;

    setIsSharing(true);
    try {
      await sharePDF(pdf.uri);
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share PDF');
    }
    setIsSharing(false);
  };

  const handleDelete = (): void => {
    if (!pdf) return;

    Alert.alert(
      'Delete PDF',
      `Are you sure you want to delete "${pdf.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            await removePDF(pdf.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!pdf) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={RS(24)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {pdf.name}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {pdf.thumbnail ? (
          <View style={styles.pdfPreview}>
            <Image
              source={{ uri: pdf.thumbnail }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.noPreviewContainer}>
            <MaterialIcons name="picture-as-pdf" size={RS(64)} color={theme.colors.textLight} />
            <Text style={styles.noPreviewText}>No preview available</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={isSharing || isDeleting}
        >
          {isSharing ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <MaterialIcons name="share" size={RS(20)} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={isSharing || isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color={theme.colors.danger} />
          ) : (
            <>
              <MaterialIcons name="delete" size={RS(20)} color={theme.colors.danger} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  backButton: {
    padding: RS(8),
  },
  headerTitle: {
    flex: 1,
    fontSize: RF(18),
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: RS(8),
  },
  placeholder: {
    width: RS(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: RS(16),
  },
  pdfPreview: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: RS(16),
    marginBottom: RS(16),
    alignItems: 'center',
    ...theme.shadows.md,
  },
  previewImage: {
    width: SCREEN_WIDTH - RS(64),
    height: (SCREEN_WIDTH - RS(64)) * 1.4,
    borderRadius: theme.radius.md,
  },
  noPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: RS(64),
  },
  noPreviewText: {
    fontSize: RF(16),
    fontWeight: '500',
    color: theme.colors.textLight,
    marginTop: RS(16),
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
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: RS(8),
    paddingVertical: RS(14),
    borderRadius: theme.radius.md,
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  actionButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    color: theme.colors.white,
  },
  deleteButtonText: {
    color: theme.colors.danger,
  },
});
