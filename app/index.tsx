import React from 'react';
import { View, StyleSheet } from "react-native";
import Weather from '../components/Weather';

export default function Index() {
  return (
    <View style={styles.container}>
      <Weather/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weather: {
    flex: 1,  // Make the Weather component fill the remaining space
  },
});
