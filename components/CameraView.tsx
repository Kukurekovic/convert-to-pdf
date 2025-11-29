import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import type { ImageAsset } from '../types/document';

interface CameraViewProps {
  onCapture: (image: ImageAsset) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = Array.isArray(devices)
    ? devices.find(d => d.position === 'back')
    : (devices as any)?.back;

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async (): Promise<void> => {
    try {
      const cameraPermission = await Camera.getCameraPermissionStatus();

      if (cameraPermission === 'not-determined') {
        const newCameraPermission = await Camera.requestCameraPermission();
        setHasPermission(newCameraPermission === 'granted');
      } else {
        setHasPermission(cameraPermission === 'granted');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      Alert.alert('Error', 'Failed to check camera permissions');
    }
    setIsLoading(false);
  };

  const takePhoto = async (): Promise<void> => {
    if (!camera.current) return;

    setIsTakingPhoto(true);
    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      const uri = `file://${photo.path}`;
      onCapture({ uri, width: photo.width, height: photo.height });
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
    setIsTakingPhoto(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan documents
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={checkPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No camera device found</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Document</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={[styles.captureButton, isTakingPhoto && styles.captureButtonDisabled]}
              onPress={takePhoto}
              disabled={isTakingPhoto}
            >
              {isTakingPhoto ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.instructionText}>
            Position document within frame and tap to capture
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: RF(16),
    color: theme.colors.white,
    marginTop: RS(16),
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RS(32),
  },
  permissionText: {
    fontSize: RF(16),
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: RS(24),
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: RS(12),
    paddingHorizontal: RS(32),
    borderRadius: theme.radius.md,
    marginBottom: RS(12),
  },
  permissionButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
    color: theme.colors.white,
  },
  cancelButton: {
    paddingVertical: RS(12),
    paddingHorizontal: RS(32),
  },
  cancelButtonText: {
    fontSize: RF(16),
    color: theme.colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: RF(16),
    color: theme.colors.white,
    marginBottom: RS(24),
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: RS(16),
    paddingVertical: RS(12),
  },
  closeButton: {
    width: RS(40),
    height: RS(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.radius.full,
  },
  closeButtonText: {
    fontSize: RF(24),
    color: theme.colors.white,
  },
  headerTitle: {
    fontSize: RF(18),
    fontWeight: '700',
    color: theme.colors.white,
  },
  placeholder: {
    width: RS(40),
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: RS(32),
  },
  captureButtonContainer: {
    marginBottom: RS(16),
  },
  captureButton: {
    width: RS(80),
    height: RS(80),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: RS(4),
    borderColor: theme.colors.primary,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: RS(64),
    height: RS(64),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  instructionText: {
    fontSize: RF(14),
    color: theme.colors.white,
    textAlign: 'center',
    paddingHorizontal: RS(32),
  },
});

export default CameraView;
