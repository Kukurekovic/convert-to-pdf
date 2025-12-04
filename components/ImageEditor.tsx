import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import { rotateImage, flipImage, applyFilter } from '../utils/imageUtils';
import type { ImageAsset, FilterType, FlipDirection } from '../types/document';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageEditorProps {
  image: ImageAsset;
  onSave: (image: ImageAsset) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSave, onCancel }) => {
  const [currentUri, setCurrentUri] = useState<string>(image.uri);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);

  const handleRotate = async (degrees: number): Promise<void> => {
    setIsProcessing(true);
    try {
      const newUri = await rotateImage(currentUri, degrees);
      setCurrentUri(newUri);
    } catch (error) {
      console.error('Error rotating image:', error);
    }
    setIsProcessing(false);
  };

  const handleFlip = async (direction: FlipDirection): Promise<void> => {
    setIsProcessing(true);
    try {
      const newUri = await flipImage(currentUri, direction);
      setCurrentUri(newUri);
    } catch (error) {
      console.error('Error flipping image:', error);
    }
    setIsProcessing(false);
  };

  const handleFilter = async (filterType: FilterType): Promise<void> => {
    setIsProcessing(true);
    try {
      const newUri = await applyFilter(currentUri, filterType);
      setCurrentUri(newUri);
      setActiveFilter(filterType);
    } catch (error) {
      console.error('Error applying filter:', error);
    }
    setIsProcessing(false);
  };

  const handleSave = (): void => {
    onSave({ ...image, uri: currentUri });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Image</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: currentUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.controls}>
        <Text style={styles.sectionTitle}>Rotate & Flip</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.buttonRow}
        >
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleRotate(-90)}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>↺ 90°</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleRotate(90)}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>↻ 90°</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleFlip('horizontal')}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>⇄ Flip H</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleFlip('vertical')}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>⇅ Flip V</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: RS(16) }]}>Filters</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.buttonRow}
        >
          <TouchableOpacity
            style={[
              styles.controlButton,
              activeFilter === 'original' && styles.activeButton,
            ]}
            onPress={() => {
              setCurrentUri(image.uri);
              setActiveFilter('original');
            }}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>Original</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlButton,
              activeFilter === 'grayscale' && styles.activeButton,
            ]}
            onPress={() => handleFilter('grayscale')}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>Grayscale</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlButton,
              activeFilter === 'enhance' && styles.activeButton,
            ]}
            onPress={() => handleFilter('enhance')}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>Enhance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlButton,
              activeFilter === 'blackwhite' && styles.activeButton,
            ]}
            onPress={() => handleFilter('blackwhite')}
            disabled={isProcessing}
          >
            <Text style={styles.controlButtonText}>B&W</Text>
          </TouchableOpacity>
        </ScrollView>
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
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH - RS(32),
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  controls: {
    backgroundColor: theme.colors.white,
    paddingVertical: RS(16),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: RF(14),
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: RS(8),
    paddingHorizontal: RS(16),
    fontFamily: 'Urbanist_600SemiBold',
  },
  buttonRow: {
    paddingHorizontal: RS(16),
  },
  controlButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: RS(12),
    paddingHorizontal: RS(20),
    borderRadius: theme.radius.md,
    marginRight: RS(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  controlButtonText: {
    fontSize: RF(14),
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'Urbanist_600SemiBold',
  },
});

export default ImageEditor;
