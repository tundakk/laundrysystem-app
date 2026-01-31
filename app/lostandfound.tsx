import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useTranslation } from 'react-i18next';
import CameraComponent from '../components/CameraComponent';
import { reportLostAndFound } from '../services/apiService';

type Screen = 'menu' | 'camera' | 'form';

export default function LostAndFoundScreen() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { t } = useTranslation();

  const handlePhotoTaken = (uri: string) => {
    setPhotoUri(uri);
    setScreen('form');
  };

  const handlePickFromGallery = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('lostFound.permissionNeeded'), t('lostFound.galleryAccess'));
      return;
    }

    const assets = await MediaLibrary.getAssetsAsync({
      first: 1,
      sortBy: [MediaLibrary.SortBy.creationTime],
      mediaType: MediaLibrary.MediaType.photo,
    });

    if (assets.assets.length > 0) {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(assets.assets[0]);
      if (assetInfo.localUri) {
        setPhotoUri(assetInfo.localUri);
        setScreen('form');
      }
    } else {
      Alert.alert(t('lostFound.noPhotos'), t('lostFound.noPhotosFound'));
    }
  };

  const handleSubmit = async () => {
    if (!photoUri) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      await reportLostAndFound(photoUri, description, '1', (progress) => {
        setUploadProgress(progress);
      });

      Alert.alert(t('lostFound.successTitle'), t('lostFound.success'), [
        {
          text: 'OK',
          onPress: () => {
            setPhotoUri(null);
            setDescription('');
            setScreen('menu');
          },
        },
      ]);
    } catch (error) {
      Alert.alert(t('lostFound.uploadFailedTitle'), t('lostFound.uploadFailed'));
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setPhotoUri(null);
    setDescription('');
    setScreen('menu');
  };

  if (screen === 'camera') {
    return (
      <View style={styles.fullScreen}>
        <CameraComponent onPhotoTaken={handlePhotoTaken} />
        <TouchableOpacity style={styles.cancelButton} onPress={() => setScreen('menu')}>
          <Text style={styles.cancelButtonText}>{t('lostFound.cancel')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'form') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.title}>{t('lostFound.reportTitle')}</Text>

          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
          )}

          <TouchableOpacity style={styles.retakeButton} onPress={() => setScreen('camera')}>
            <Text style={styles.retakeText}>{t('lostFound.retakePhoto')}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>{t('lostFound.description')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('lostFound.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            editable={!uploading}
          />

          {uploading && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color="#f4511e" />
              <Text style={styles.progressText}>{t('lostFound.uploading', { progress: uploadProgress })}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
              </View>
            </View>
          )}

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.submitButton, uploading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={uploading}
            >
              <Text style={styles.submitText}>{uploading ? t('lostFound.uploading', { progress: uploadProgress }) : t('lostFound.submit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelFormButton}
              onPress={handleCancel}
              disabled={uploading}
            >
              <Text style={styles.cancelFormText}>{t('lostFound.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Menu screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('lostFound.title')}</Text>
      <Text style={styles.instructions}>
        {t('lostFound.instructions')}
      </Text>

      <TouchableOpacity style={styles.menuButton} onPress={() => setScreen('camera')}>
        <Text style={styles.menuButtonText}>{t('lostFound.takePhoto')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={handlePickFromGallery}>
        <Text style={styles.menuButtonText}>{t('lostFound.chooseGallery')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fullScreen: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
    alignItems: 'center',
  },
  preview: {
    width: 280,
    height: 280,
    borderRadius: 8,
    marginBottom: 16,
  },
  retakeButton: {
    marginBottom: 20,
  },
  retakeText: {
    color: '#f4511e',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginTop: 8,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#f4511e',
    borderRadius: 3,
  },
  formButtons: {
    width: '100%',
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelFormButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelFormText: {
    color: '#555',
    fontSize: 16,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
