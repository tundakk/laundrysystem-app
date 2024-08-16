import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import CalendarTable from '../components/CalendarTable';

export default function BookingScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <CalendarTable />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
});
