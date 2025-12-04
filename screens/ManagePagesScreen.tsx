import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useDocumentStore from '../store/useDocumentStore';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { ManagePagesScreenProps } from '../types/navigation';

interface PageItem {
  id: string;
  uri: string;
  index: number;
  selected: boolean;
}

export default function ManagePagesScreen({ route, navigation }: ManagePagesScreenProps) {
  const { pdfId } = route.params;
  const savedPDFs = useDocumentStore((state) => state.savedPDFs);
  const reorderPages = useDocumentStore((state) => state.reorderPages);
  const deletePages = useDocumentStore((state) => state.deletePages);

  const pdf = savedPDFs.find((p) => p.id === pdfId);
  const pageThumbnails = pdf?.pageThumbnails ?? (pdf?.thumbnail ? [pdf.thumbnail] : []);

  const [pages, setPages] = useState<PageItem[]>(
    pageThumbnails.map((uri, index) => ({
      id: `page-${index}`,
      uri,
      index,
      selected: false,
    }))
  );

  // Update pages when PDF data changes
  useEffect(() => {
    const updatedThumbnails = pdf?.pageThumbnails ?? (pdf?.thumbnail ? [pdf.thumbnail] : []);
    setPages(
      updatedThumbnails.map((uri, index) => ({
        id: `page-${index}`,
        uri,
        index,
        selected: false,
      }))
    );
  }, [pdf?.pageThumbnails, pdf?.thumbnail]);

  const togglePageSelection = (id: string): void => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === id ? { ...page, selected: !page.selected } : page
      )
    );
  };

  const selectAll = (): void => {
    setPages((prevPages) => prevPages.map((page) => ({ ...page, selected: true })));
  };

  const deselectAll = (): void => {
    setPages((prevPages) => prevPages.map((page) => ({ ...page, selected: false })));
  };

  const movePageUp = (index: number): void => {
    if (index === 0 || !pages[index] || !pages[index - 1]) return;

    const newPages = [...pages];
    const temp = newPages[index]!;
    newPages[index] = newPages[index - 1]!;
    newPages[index - 1] = temp;

    // Update indices
    const reindexed = newPages.map((page, idx) => ({ ...page, index: idx }));
    setPages(reindexed);

    // Save to store
    if (pdf) {
      const newPageOrder = reindexed.map(p => p.uri);
      reorderPages(pdf.id, newPageOrder);
    }
  };

  const movePageDown = (index: number): void => {
    if (index === pages.length - 1 || !pages[index] || !pages[index + 1]) return;

    const newPages = [...pages];
    const temp = newPages[index]!;
    newPages[index] = newPages[index + 1]!;
    newPages[index + 1] = temp;

    // Update indices
    const reindexed = newPages.map((page, idx) => ({ ...page, index: idx }));
    setPages(reindexed);

    // Save to store
    if (pdf) {
      const newPageOrder = reindexed.map(p => p.uri);
      reorderPages(pdf.id, newPageOrder);
    }
  };

  const handleDeleteSelected = (): void => {
    const selectedIndices = pages
      .filter(p => p.selected)
      .map(p => p.index);

    if (selectedIndices.length === 0) {
      Alert.alert('No Pages Selected', 'Please select at least one page to delete.');
      return;
    }

    if (selectedIndices.length === pages.length) {
      Alert.alert('Cannot Delete All Pages', 'You must keep at least one page in the document.');
      return;
    }

    Alert.alert(
      'Delete Pages',
      `Are you sure you want to delete ${selectedIndices.length} page(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (pdf) {
              deletePages(pdf.id, selectedIndices);
              // Update will happen via useEffect when store updates
            }
          },
        },
      ]
    );
  };

  const renderPageItem = ({ item, index }: { item: PageItem; index: number }) => {
    if (!item) return null;

    return (
      <View
        style={[
          styles.pageItem,
          item.selected && styles.pageItemSelected,
        ]}
      >
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => togglePageSelection(item.id)}
        >
          <MaterialIcons
            name={item.selected ? 'check-box' : 'check-box-outline-blank'}
            size={RS(24)}
            color={item.selected ? theme.colors.primary : theme.colors.textLight}
          />
        </TouchableOpacity>

        <View style={styles.pageImageContainer}>
          <Image source={{ uri: item.uri }} style={styles.pageImage} resizeMode="contain" />
        </View>

        <View style={styles.pageInfoContainer}>
          <Text style={styles.pageNumber}>Page {item.index + 1}</Text>
        </View>

        <View style={styles.reorderButtons}>
          <TouchableOpacity
            style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
            onPress={() => movePageUp(index)}
            disabled={index === 0}
          >
            <MaterialIcons
              name="arrow-upward"
              size={RS(20)}
              color={index === 0 ? theme.colors.textLight : theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.reorderButton,
              index === pages.length - 1 && styles.reorderButtonDisabled
            ]}
            onPress={() => movePageDown(index)}
            disabled={index === pages.length - 1}
          >
            <MaterialIcons
              name="arrow-downward"
              size={RS(20)}
              color={index === pages.length - 1 ? theme.colors.textLight : theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={RS(24)} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Pages</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={selectAll}>
          <MaterialIcons name="select-all" size={RS(20)} color={theme.colors.primary} />
          <Text style={styles.toolbarButtonText}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={deselectAll}>
          <MaterialIcons name="deselect" size={RS(20)} color={theme.colors.primary} />
          <Text style={styles.toolbarButtonText}>Deselect</Text>
        </TouchableOpacity>
        {selectedCount > 0 && (
          <Text style={styles.selectedCount}>{selectedCount} selected</Text>
        )}
      </View>

      <FlatList
        data={pages}
        renderItem={renderPageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            selectedCount === 0 && styles.deleteButtonDisabled
          ]}
          onPress={handleDeleteSelected}
          disabled={selectedCount === 0}
        >
          <MaterialIcons
            name="delete"
            size={RS(20)}
            color={selectedCount === 0 ? theme.colors.textLight : theme.colors.white}
          />
          <Text
            style={[
              styles.deleteButtonText,
              selectedCount === 0 && styles.deleteButtonTextDisabled
            ]}
          >
            Delete Selected
          </Text>
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
    fontFamily: 'Urbanist_700Bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: RS(8),
  },
  placeholder: {
    width: RS(40),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: RS(16),
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RS(6),
  },
  toolbarButtonText: {
    fontSize: RF(14),
    fontWeight: '500',
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.primary,
  },
  selectedCount: {
    marginLeft: 'auto',
    fontSize: RF(14),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
  },
  listContainer: {
    padding: RS(12),
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RS(12),
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: RS(12),
    ...theme.shadows.light,
  },
  pageItemSelected: {
    borderColor: theme.colors.primary,
  },
  checkboxContainer: {
    padding: RS(4),
    marginRight: RS(12),
  },
  pageImageContainer: {
    width: RS(60),
    height: RS(85),
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  pageInfoContainer: {
    flex: 1,
    marginLeft: RS(12),
  },
  pageNumber: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
  },
  reorderButtons: {
    flexDirection: 'column',
    gap: RS(8),
    marginLeft: RS(12),
  },
  reorderButton: {
    padding: RS(8),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  footer: {
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: RS(8),
    paddingVertical: RS(14),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.danger,
  },
  deleteButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
  deleteButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.white,
  },
  deleteButtonTextDisabled: {
    color: theme.colors.textLight,
  },
});
