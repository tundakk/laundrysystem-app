import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

const numColumns = 3;
const { width } = Dimensions.get('window');

export default function GalleryScreen() {
  const [photos, setPhotos] = React.useState<MediaLibrary.Asset[]>([]);
  const [mediaLibraryPermission, requestPermission] = MediaLibrary.usePermissions();

  React.useEffect(() => {
    if (mediaLibraryPermission?.granted) {
      loadPhotos();
    } else {
      requestPermission();
    }
  }, [mediaLibraryPermission]);

  const loadPhotos = async () => {
    const album = await MediaLibrary.getAlbumAsync('Camera');
    const media = await MediaLibrary.getAssetsAsync({
      first: 100,
      album: album || undefined,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });
    setPhotos(media.assets);
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => (
    <Image
      style={styles.imageThumbnail}
      source={{ uri: item.uri }}
    />
  );

  return (
    <View style={styles.container}>
      {mediaLibraryPermission?.granted ? (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
        />
      ) : (
        <Text style={styles.permissionText}>Permission is required to access the gallery.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageThumbnail: {
    width: width / numColumns,
    height: width / numColumns,
    margin: 1,
  },
  permissionText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});
