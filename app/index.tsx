import React from 'react';
import { Text, View } from "react-native";
import { Link } from 'expo-router';
import Weather from '../components/Weather';  // Adjust the path if necessary

export default function Index() {
  return (
    <>
    <Weather />
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      
      <Link href="/booking">booking</Link>
    </View>
</>
  );
}
