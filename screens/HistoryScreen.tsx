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
  TextInput,
  Modal,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import useDocumentStore from '../store/useDocumentStore';
import { formatFileSize, formatDate, sharePDF } from '../utils/pdfUtils';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { HistoryListScreenProps } from '../types/navigation';
import type { PDFDocument } from '../types/document';

type SortOption = 'name-asc' | 'name-desc' | 'date-oldest' | 'date-newest' | 'size-smallest' | 'size-largest';

export default function HistoryScreen({ navigation }: HistoryListScreenProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const savedPDFs = useDocumentStore((state) => state.savedPDFs);
  const loadPDFs = useDocumentStore((state) => state.loadPDFs);
  const clearAllPDFs = useDocumentStore((state) => state.clearAllPDFs);
  const removePDF = useDocumentStore((state) => state.removePDF);

  useEffect(() => {
    loadPDFsFromStorage();
  }, []);

  const loadPDFsFromStorage = async (): Promise<void> => {
    setIsLoading(true);
    await loadPDFs();
    setIsLoading(false);
  };

  const sortPDFs = (pdfs: PDFDocument[]): PDFDocument[] => {
    const sorted = [...pdfs];
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'date-oldest':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case 'date-newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'size-smallest':
        return sorted.sort((a, b) => a.size - b.size);
      case 'size-largest':
        return sorted.sort((a, b) => b.size - a.size);
      default:
        return sorted;
    }
  };

  const filteredPDFs = sortPDFs(
    savedPDFs.filter((pdf) =>
      pdf.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSortSelect = (option: SortOption): void => {
    setSortBy(option);
    setShowSortMenu(false);
  };

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'name-asc':
        return 'Name (A-Z)';
      case 'name-desc':
        return 'Name (Z-A)';
      case 'date-oldest':
        return 'Date (Oldest)';
      case 'date-newest':
        return 'Date (Newest)';
      case 'size-smallest':
        return 'Size (Smallest)';
      case 'size-largest':
        return 'Size (Largest)';
    }
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

  const handleShare = async (pdf: PDFDocument): Promise<void> => {
    try {
      await sharePDF(pdf.uri);
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to share PDF');
    }
  };

  const handleDelete = (pdf: PDFDocument): void => {
    Alert.alert(
      'Delete PDF',
      `Are you sure you want to delete "${pdf.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removePDF(pdf.id);
          },
        },
      ]
    );
  };

  const renderRightActions = (pdf: PDFDocument) => (
    <View style={styles.swipeActionsContainer}>
      <TouchableOpacity
        style={[styles.swipeAction, styles.swipeShareAction]}
        onPress={() => handleShare(pdf)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="share" size={RS(24)} color={theme.colors.white} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, styles.swipeDeleteAction]}
        onPress={() => handleDelete(pdf)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete" size={RS(24)} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderPDFItem: ListRenderItem<PDFDocument> = ({ item }) => (
    <View style={styles.swipeableWrapper}>
      <ReanimatedSwipeable
        renderRightActions={() => renderRightActions(item)}
        overshootRight={false}
        overshootFriction={8}
        rightThreshold={40}
      >
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
          color={theme.colors.white}
        />
      </TouchableOpacity>
    </ReanimatedSwipeable>
    </View>
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
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          {savedPDFs.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {savedPDFs.length > 0 && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <MaterialIcons
                name="search"
                size={RS(20)}
                color={theme.colors.textLight}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search PDFs..."
                placeholderTextColor={theme.colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons
                    name="close"
                    size={RS(20)}
                    color={theme.colors.textLight}
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortMenu(true)}
            >
              <MaterialIcons
                name="sort"
                size={RS(24)}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={showSortMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSortMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSortMenu(false)}
          >
            <View style={styles.sortMenu}>
              <Text style={styles.sortMenuTitle}>Sort by</Text>
              {(['name-asc', 'name-desc', 'date-oldest', 'date-newest', 'size-smallest', 'size-largest'] as SortOption[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.sortMenuItem}
                  onPress={() => handleSortSelect(option)}
                >
                  <Text style={styles.sortMenuItemText}>
                    {getSortLabel(option)}
                  </Text>
                  {sortBy === option && (
                    <MaterialIcons
                      name="check"
                      size={RS(20)}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredPDFs}
            renderItem={renderPDFItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              filteredPDFs.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
  },
  clearAllText: {
    fontSize: RF(14),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
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
  swipeableWrapper: {
    marginBottom: RS(12),
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1596E8',
    borderRadius: theme.radius.lg,
    padding: RS(16),
    ...theme.shadows.md,
  },
  pdfIcon: {
    width: RS(50),
    height: RS(60),
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: RS(12),
  },
  pdfIconText: {
    fontSize: RF(12),
    fontWeight: '700',
    fontFamily: 'Urbanist_700Bold',
    color: '#312E81',
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
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.white,
    marginBottom: RS(4),
  },
  pdfMeta: {
    fontSize: RF(12),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.white,
    marginBottom: RS(2),
  },
  pdfPages: {
    fontSize: RF(12),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.white,
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
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
    marginBottom: RS(8),
  },
  emptyText: {
    fontSize: RF(16),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeAction: {
    width: RS(70),
    height: RS(60) + RS(32), // thumbnail height (60) + padding (16 * 2)
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeShareAction: {
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.radius.lg,
    borderBottomLeftRadius: theme.radius.lg,
  },
  swipeDeleteAction: {
    backgroundColor: theme.colors.danger,
    borderTopRightRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    gap: RS(12),
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    paddingHorizontal: RS(12),
    paddingVertical: RS(10),
    ...theme.shadows.light,
  },
  searchIcon: {
    marginRight: RS(8),
  },
  searchInput: {
    flex: 1,
    fontSize: RF(14),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.text,
  },
  sortButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: RS(10),
    ...theme.shadows.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortMenu: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: RS(16),
    width: '80%',
    maxWidth: RS(300),
    ...theme.shadows.lg,
  },
  sortMenuTitle: {
    fontSize: RF(18),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
    marginBottom: RS(16),
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: RS(12),
    paddingHorizontal: RS(8),
    borderRadius: theme.radius.md,
  },
  sortMenuItemText: {
    fontSize: RF(16),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.text,
  },
});
