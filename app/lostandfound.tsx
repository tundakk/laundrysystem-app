import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CameraComponent from '../components/CameraComponent';

export default function LostAndFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lost and Found</Text>
      <CameraComponent />
      <Text style={styles.instructions}>
        Use the camera to take a picture of the item you found or lost.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
});
