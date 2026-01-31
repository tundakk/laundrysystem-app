import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { fetchMyBookings, cancelBooking, MyBooking } from '../services/apiService';

export default function MyBookingsScreen() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, [loadBookings]);

  const handleCancel = (booking: MyBooking) => {
    Alert.alert(
      t('myBookings.confirmTitle'),
      t('myBookings.confirmMessage', {
        room: booking.roomName,
        time: formatTime(booking.startTime),
      }),
      [
        { text: t('myBookings.no'), style: 'cancel' },
        {
          text: t('myBookings.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(booking.id);
              loadBookings();
            } catch (error) {
              Alert.alert(
                t('myBookings.errorTitle'),
                t('myBookings.cancelFailed')
              );
            }
          },
        },
      ]
    );
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#f4511e" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>{t('myBookings.title')}</Text>

        {bookings.length === 0 ? (
          <Text style={styles.emptyText}>{t('myBookings.noBookings')}</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.roomName}>{booking.roomName}</Text>
                <Text style={styles.roomLocation}>{booking.roomLocation}</Text>
                <Text style={styles.dateTime}>
                  {formatDate(booking.startTime)} · {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancel(booking)}
              >
                <Text style={styles.cancelButtonText}>{t('myBookings.cancel')}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
  },
  roomLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  dateTime: {
    fontSize: 14,
    color: '#333',
    marginTop: 6,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
