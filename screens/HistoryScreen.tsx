import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useDocumentStore from '../store/useDocumentStore';
import { formatFileSize, formatDate } from '../utils/pdfUtils';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { HistoryListScreenProps } from '../types/navigation';
import type { PDFDocument } from '../types/document';

export default function HistoryScreen({ navigation }: HistoryListScreenProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const savedPDFs = useDocumentStore((state) => state.savedPDFs);
  const loadPDFs = useDocumentStore((state) => state.loadPDFs);
  const clearAllPDFs = useDocumentStore((state) => state.clearAllPDFs);

  useEffect(() => {
    loadPDFsFromStorage();
  }, []);

  const loadPDFsFromStorage = async (): Promise<void> => {
    setIsLoading(true);
    await loadPDFs();
    setIsLoading(false);
  };

  const handleClearAll = (): void => {
    if (savedPDFs.length === 0) return;

    Alert.alert(
      'Clear All',
      'Are you sure you want to delete all PDFs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllPDFs();
          },
        },
      ]
    );
  };

  const handlePDFPress = (pdf: PDFDocument): void => {
    navigation.navigate('PDFDetail', { pdfId: pdf.id });
  };

  const renderPDFItem: ListRenderItem<PDFDocument> = ({ item }) => (
    <TouchableOpacity
      style={styles.pdfItem}
      onPress={() => handlePDFPress(item)}
      activeOpacity={0.7}
    >
      {item.thumbnail ? (
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.pdfThumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.pdfIcon}>
          <Text style={styles.pdfIconText}>PDF</Text>
        </View>
      )}
      <View style={styles.pdfDetails}>
        <Text style={styles.pdfName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.pdfMeta}>
          {formatFileSize(item.size)} · {formatDate(item.createdAt)}
        </Text>
        {item.pageCount && (
          <Text style={styles.pdfPages}>
            {item.pageCount} page{item.pageCount > 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={RS(24)}
        color={theme.colors.textLight}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyTitle}>No PDFs Yet</Text>
      <Text style={styles.emptyText}>
        Convert images to PDF to see them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {savedPDFs.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={savedPDFs}
          renderItem={renderPDFItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            savedPDFs.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: RS(24),
    paddingVertical: RS(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: RF(28),
    fontWeight: '700',
    color: theme.colors.text,
  },
  clearAllText: {
    fontSize: RF(14),
    fontWeight: '600',
    color: theme.colors.danger,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: RS(16),
  },
  listContentEmpty: {
    flex: 1,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: RS(16),
    marginBottom: RS(12),
    ...theme.shadows.md,
  },
  pdfIcon: {
    width: RS(50),
    height: RS(60),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: RS(12),
  },
  pdfIconText: {
    fontSize: RF(12),
    fontWeight: '700',
    color: theme.colors.white,
  },
  pdfThumbnail: {
    width: RS(50),
    height: RS(60),
    borderRadius: theme.radius.md,
    marginRight: RS(12),
    backgroundColor: theme.colors.surface,
  },
  pdfDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  pdfName: {
    fontSize: RF(16),
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: RS(4),
  },
  pdfMeta: {
    fontSize: RF(12),
    color: theme.colors.textLight,
    marginBottom: RS(2),
  },
  pdfPages: {
    fontSize: RF(12),
    color: theme.colors.textLight,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RS(32),
  },
  emptyIcon: {
    fontSize: RF(64),
    marginBottom: RS(16),
  },
  emptyTitle: {
    fontSize: RF(24),
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: RS(8),
  },
  emptyText: {
    fontSize: RF(16),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
