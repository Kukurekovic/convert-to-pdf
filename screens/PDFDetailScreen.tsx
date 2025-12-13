import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useDocumentStore from '../store/useDocumentStore';
import { sharePDF, sanitizeFileName } from '../utils/pdfUtils';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { PDFDetailScreenProps } from '../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PDFDetailScreen({ route, navigation }: PDFDetailScreenProps) {
  const { pdfId } = route.params;
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const savedPDFs = useDocumentStore((state) => state.savedPDFs);
  const removePDF = useDocumentStore((state) => state.removePDF);
  const renamePDF = useDocumentStore((state) => state.renamePDF);

  const pdf = savedPDFs.find((p) => p.id === pdfId);
  const pageThumbnails = pdf?.pageThumbnails ?? (pdf?.thumbnail ? [pdf.thumbnail] : []);
  const totalPages = pageThumbnails.length;

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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(pageIndex + 1);
  };

  const goToPage = (pageNumber: number): void => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    flatListRef.current?.scrollToIndex({ index: pageNumber - 1, animated: true });
  };

  const goToPreviousPage = (): void => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = (): void => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const handleMenuOption = (option: 'rename' | 'manage'): void => {
    setShowMenu(false);
    if (option === 'rename') {
      setNewFileName(pdf?.name || '');
      setShowRenameModal(true);
    } else {
      navigation.navigate('ManagePages', { pdfId });
    }
  };

  const handleCancelRename = (): void => {
    setShowRenameModal(false);
    setNewFileName('');
  };

  const handleSaveRename = (): void => {
    if (!pdf) return;

    const trimmedName = newFileName.trim();

    // Validate that the name is not empty
    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Please enter a valid filename.');
      return;
    }

    // Sanitize the filename for cross-platform compatibility
    const sanitized = sanitizeFileName(trimmedName);

    // Save the sanitized name
    renamePDF(pdf.id, sanitized);
    setShowRenameModal(false);
    setNewFileName('');
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
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          style={styles.menuButton}
        >
          <MaterialIcons
            name="more-vert"
            size={RS(24)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('rename')}
            >
              <MaterialIcons name="edit" size={RS(20)} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Rename document</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('manage')}
            >
              <MaterialIcons name="reorder" size={RS(20)} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Manage pages</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <TouchableOpacity
          style={styles.renameOverlay}
          activeOpacity={1}
          onPress={() => setShowRenameModal(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.renameModalContainer}>
              <Text style={styles.renameModalTitle}>Rename Document</Text>
              <TextInput
                style={styles.renameInput}
                value={newFileName}
                onChangeText={setNewFileName}
                placeholder="Enter new name"
                placeholderTextColor={theme.colors.textLight}
                autoFocus
              />
              <View style={styles.renameButtonContainer}>
                <TouchableOpacity
                  style={[styles.renameButton, styles.cancelButton]}
                  onPress={handleCancelRename}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.renameButton, styles.saveButton]}
                  onPress={handleSaveRename}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {totalPages > 0 ? (
        <>
          {totalPages > 1 && (
            <View style={styles.paginationIndicator}>
              <TouchableOpacity
                onPress={goToPreviousPage}
                style={styles.chevronButton}
              >
                <MaterialIcons
                  name="chevron-left"
                  size={RS(28)}
                  color={currentPage > 1 ? theme.colors.primary : theme.colors.textLight}
                />
              </TouchableOpacity>
              <Text style={styles.paginationText}>
                {currentPage}/{totalPages}
              </Text>
              <TouchableOpacity
                onPress={goToNextPage}
                style={styles.chevronButton}
              >
                <MaterialIcons
                  name="chevron-right"
                  size={RS(28)}
                  color={currentPage < totalPages ? theme.colors.primary : theme.colors.textLight}
                />
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            ref={flatListRef}
            data={pageThumbnails}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(_item, index) => `page-${index}`}
            renderItem={({ item }) => (
              <View style={styles.pageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </>
      ) : (
        <View style={styles.noPreviewContainer}>
          <MaterialIcons name="picture-as-pdf" size={RS(64)} color={theme.colors.textLight} />
          <Text style={styles.noPreviewText}>No preview available</Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={isSharing || isDeleting}
        >
          <>
            <MaterialIcons name="share" size={RS(20)} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </>
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
    backgroundColor: '#e1e5f2',
  },
  backButton: {
    padding: RS(8),
  },
  headerTitle: {
    flex: 1,
    fontSize: RF(18),
    fontWeight: '700',
    fontFamily: 'Urbanist_700Bold',
    color: 'black',
    textAlign: 'center',
    marginHorizontal: RS(8),
  },
  menuButton: {
    padding: RS(8),
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: RS(60),
    paddingRight: RS(16),
  },
  menuContainer: {
    backgroundColor: '#e1e5f2',
    borderRadius: theme.radius.md,
    minWidth: RS(200),
    ...theme.shadows.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RS(14),
    paddingHorizontal: RS(16),
    gap: RS(12),
  },
  menuItemText: {
    fontSize: RF(16),
    fontWeight: '500',
    fontFamily: 'Urbanist_400Regular',
    color: 'black',
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  paginationIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: RS(12),
    paddingHorizontal: RS(16),
    backgroundColor: '#e1e5f2',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: RS(16),
  },
  chevronButton: {
    padding: RS(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: RF(14),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: 'black',
    minWidth: RS(50),
    textAlign: 'center',
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: RS(16),
  },
  previewImage: {
    width: SCREEN_WIDTH - RS(32),
    height: '100%',
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
    fontFamily: 'Urbanist_400Regular',
    color: 'black',
    marginTop: RS(16),
  },
  footer: {
    flexDirection: 'row',
    gap: RS(12),
    paddingHorizontal: RS(16),
    paddingVertical: RS(16),
    paddingBottom: RS(100),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#e1e5f2',
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
    backgroundColor: theme.colors.white,
  },
  deleteButton: {
    backgroundColor: theme.colors.white,
  },
  actionButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.primary,
  },
  deleteButtonText: {
    color: theme.colors.danger,
  },
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: RS(20),
  },
  renameModalContainer: {
    backgroundColor: '#e1e5f2',
    borderRadius: theme.radius.lg,
    padding: RS(24),
    width: SCREEN_WIDTH - RS(48),
    maxWidth: RS(400),
    ...theme.shadows.lg,
  },
  renameModalTitle: {
    fontSize: RF(20),
    fontWeight: '700',
    fontFamily: 'Urbanist_700Bold',
    color: 'black',
    marginBottom: RS(16),
    textAlign: 'center',
  },
  renameInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    fontSize: RF(16),
    fontFamily: 'Urbanist_400Regular',
    color: 'black',
    marginBottom: RS(20),
  },
  renameButtonContainer: {
    flexDirection: 'row',
    gap: RS(12),
  },
  renameButton: {
    flex: 1,
    paddingVertical: RS(12),
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: 'black',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: 'white',
  },
});
