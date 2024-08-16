import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function CameraComponent() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }
  const takePicture = async () => {
    if (isCameraReady && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
  
        if (photo && photo.uri) {
          console.log('Photo taken:', photo);
  
          if (Platform.OS !== 'web') {
            if (!mediaLibraryPermission?.granted) {
              const permission = await requestMediaLibraryPermission();
              if (!permission.granted) {
                alert('Permission to access the gallery is required to save photos.');
                return;
              }
            }
  
            // Save the photo to the gallery
            const asset = await MediaLibrary.createAssetAsync(photo.uri);
            console.log('Photo saved to gallery:', asset.uri);
  
            alert('Photo saved to gallery!');
          }
        } else {
          console.error('Failed to capture photo or photo URI is undefined.');
        }
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    } else {
      console.log('Camera not ready or reference is null.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={handleCameraReady}
        onLayout={() => setIsCameraReady(true)} // Ensure camera layout is ready
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.text}>Take Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  permissionButton: {
    backgroundColor: '#f4511e',
    padding: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    width: windowWidth,
    height: windowHeight * 0.7, // Ensure height is significant enough
  },
  buttonContainer: {
    flexDirection: 'row',  // Align buttons horizontally
    justifyContent: 'space-around',  // Add space between the buttons
    width: '80%',  // Make sure buttons are centered and not too wide
    marginTop: 10,
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5, // Space between buttons
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
