import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Modal,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useTranslation } from 'react-i18next';
import CameraComponent from '../components/CameraComponent';
import {
  reportLostAndFound,
  fetchLostAndFoundItems,
  fetchLostAndFoundById,
  LostAndFoundItem,
} from '../services/apiService';

type Tab = 'browse' | 'report';
type ReportScreen = 'menu' | 'camera' | 'form';

export default function LostAndFoundScreen() {
  const [tab, setTab] = useState<Tab>('browse');
  const { t } = useTranslation();

  // Browse state
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostAndFoundItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Report state
  const [reportScreen, setReportScreen] = useState<ReportScreen>('menu');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchLostAndFoundItems(1, 50);
      setItems(data.items);
    } catch (error) {
      console.error('Failed to load lost & found items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const handleItemPress = async (item: LostAndFoundItem) => {
    setDetailLoading(true);
    setSelectedItem(item);
    try {
      const detail = await fetchLostAndFoundById(item.id);
      setSelectedItem(detail);
    } catch {
      // Use the list data as fallback
    } finally {
      setDetailLoading(false);
    }
  };

  // Report handlers
  const handlePhotoTaken = (uri: string) => {
    setPhotoUri(uri);
    setReportScreen('form');
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
        setReportScreen('form');
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
            setReportScreen('menu');
            setTab('browse');
            loadItems();
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

  const handleCancelReport = () => {
    setPhotoUri(null);
    setDescription('');
    setReportScreen('menu');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Detail modal
  const renderDetailModal = () => (
    <Modal visible={selectedItem !== null} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {detailLoading ? (
            <ActivityIndicator size="large" color="#f4511e" />
          ) : selectedItem ? (
            <ScrollView>
              <Image
                source={{ uri: selectedItem.pictureUrl }}
                style={styles.detailImage}
                resizeMode="contain"
              />
              <Text style={styles.detailDescription}>
                {selectedItem.description || t('lostFound.noDescription')}
              </Text>
              <Text style={styles.detailDate}>
                {formatDate(selectedItem.dateFound)}
              </Text>
              {selectedItem.isClaimed && (
                <Text style={styles.claimedBadge}>{t('lostFound.claimed')}</Text>
              )}
            </ScrollView>
          ) : null}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedItem(null)}
          >
            <Text style={styles.closeButtonText}>{t('lostFound.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Browse tab
  const renderBrowse = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f4511e" />
        </View>
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f4511e']} />
        }
        contentContainerStyle={items.length === 0 ? styles.centered : styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('lostFound.noItems')}</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleItemPress(item)}>
            <Image source={{ uri: item.pictureUrl }} style={styles.thumbnail} resizeMode="cover" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description || t('lostFound.noDescription')}
              </Text>
              <Text style={styles.cardDate}>{formatDate(item.dateFound)}</Text>
              {item.isClaimed && (
                <Text style={styles.cardClaimed}>{t('lostFound.claimed')}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  // Report tab - camera screen
  if (tab === 'report' && reportScreen === 'camera') {
    return (
      <View style={styles.fullScreen}>
        <CameraComponent onPhotoTaken={handlePhotoTaken} />
        <TouchableOpacity style={styles.cameraCancelButton} onPress={() => setReportScreen('menu')}>
          <Text style={styles.cameraCancelText}>{t('lostFound.cancel')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Report tab - form screen
  const renderReportForm = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.sectionTitle}>{t('lostFound.reportTitle')}</Text>
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
        )}
        <TouchableOpacity style={styles.retakeButton} onPress={() => setReportScreen('camera')}>
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
            <Text style={styles.submitText}>
              {uploading ? t('lostFound.uploading', { progress: uploadProgress }) : t('lostFound.submit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelFormButton} onPress={handleCancelReport} disabled={uploading}>
            <Text style={styles.cancelFormText}>{t('lostFound.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Report tab - menu screen
  const renderReportMenu = () => (
    <View style={styles.centered}>
      <Text style={styles.sectionTitle}>{t('lostFound.reportTitle')}</Text>
      <Text style={styles.instructions}>{t('lostFound.instructions')}</Text>
      <TouchableOpacity style={styles.menuButton} onPress={() => setReportScreen('camera')}>
        <Text style={styles.menuButtonText}>{t('lostFound.takePhoto')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={handlePickFromGallery}>
        <Text style={styles.menuButtonText}>{t('lostFound.chooseGallery')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'browse' && styles.tabButtonActive]}
          onPress={() => setTab('browse')}
        >
          <Text style={[styles.tabText, tab === 'browse' && styles.tabTextActive]}>
            {t('lostFound.browseTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'report' && styles.tabButtonActive]}
          onPress={() => setTab('report')}
        >
          <Text style={[styles.tabText, tab === 'report' && styles.tabTextActive]}>
            {t('lostFound.reportTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === 'browse' ? renderBrowse() : reportScreen === 'form' ? renderReportForm() : renderReportMenu()}

      {renderDetailModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#f4511e',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  tabTextActive: {
    color: '#f4511e',
    fontWeight: 'bold',
  },
  // Browse list
  listContent: {
    padding: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumbnail: {
    width: 90,
    height: 90,
  },
  cardInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  cardDescription: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: '#888',
  },
  cardClaimed: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  // Detail modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  detailImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 17,
    color: '#333',
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  claimedBadge: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f4511e',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Report
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
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
  cameraCancelButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cameraCancelText: {
    color: '#fff',
    fontSize: 16,
  },
});
