import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet, Platform  } from 'react-native';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center', // This centers the title and the Lost and Found link together
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>Laundry Booking</Text>
           
          </View>
        ),
        headerRight: () => (
          <View style={styles.headerRightContainer}>
             <Link href="/lostandfound" style={styles.linkText}>
              Lost and Found
            </Link>
            {Platform.OS !== 'web' && (
            <Link href="/gallery" style={styles.linkText}>
              View Gallery
            </Link>
             )}
            <Link href="/booking" style={[styles.linkText, { marginLeft: 10 }]}>
              Go to Booking
            </Link>
          </View>
        ),
      }}
    >
      <Stack.Screen name="lostandfound" options={{ title: 'Lost and Found' }} />
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="booking" options={{ title: 'Booking' }} />
      <Stack.Screen name="gallery" options={{ title: 'Gallery' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 15, // Space between title and Lost and Found link
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
});
