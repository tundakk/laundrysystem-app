import { Stack } from 'expo-router';
import { Text } from 'react-native';
import { Link } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <Link href="/booking" style={{ color: '#fff', marginRight: 10 }}>
            Go to Booking
          </Link>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="booking" options={{ title: 'Booking' }} />
    </Stack>
  );
}
