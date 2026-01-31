import { Stack, Link } from 'expo-router';
import { View, Text, StyleSheet, Platform  } from 'react-native';
import '../i18n';
import { useTranslation } from 'react-i18next';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>{t('header.title')}</Text>
          </View>
        ),
        headerRight: () => (
          <View style={styles.headerRightContainer}>
             <Link href="/lostandfound" style={styles.linkText}>
              {t('header.lostAndFound')}
            </Link>
            {Platform.OS !== 'web' && (
            <Link href="/gallery" style={styles.linkText}>
              {t('header.viewGallery')}
            </Link>
             )}
            <Link href="/booking" style={[styles.linkText, { marginLeft: 10 }]}>
              {t('header.goToBooking')}
            </Link>
            <Link href="/mybookings" style={[styles.linkText, { marginLeft: 10 }]}>
              {t('header.myBookings')}
            </Link>
          </View>
        ),
      }}
    >
      <Stack.Screen name="lostandfound" options={{ title: t('header.lostAndFound') }} />
      <Stack.Screen name="index" options={{ title: t('header.home') }} />
      <Stack.Screen name="booking" options={{ title: t('header.booking') }} />
      <Stack.Screen name="gallery" options={{ title: t('header.gallery') }} />
      <Stack.Screen name="mybookings" options={{ title: t('header.myBookings') }} />
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
    marginRight: 15,
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
