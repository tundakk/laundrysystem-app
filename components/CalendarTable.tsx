import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import PincodePopup from './PincodePopup';
import { getPincodeData } from '../services/apiService';

export default function CalendarTable() {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const { t } = useTranslation();

  const tableHead = [t('calendar.time'), ...generateDates()];
  const { width } = useWindowDimensions();

  const columnWidth = width / tableHead.length;

  const handlePress = (time: string, date: string) => {
    setSelectedTime(time);
    setSelectedDate(date);
    setPopupVisible(true);
  };

  const handlePincodeSubmit = async (houseNumber: string, pincode: string) => {
    try {
      const pincodeInt = parseInt(pincode, 10);
      const houseNumberInt = parseInt(houseNumber, 10);

      const data = await getPincodeData(pincodeInt, houseNumberInt);

      console.log(`API Response:`, data);

      alert(t('calendar.booked', { time: selectedTime, date: selectedDate, house: houseNumber, pin: pincode }));

      setPopupVisible(false);
    } catch (error) {
      console.error('API call failed:', error);
      alert(t('calendar.bookingFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
        <Row data={tableHead} style={styles.head} textStyle={styles.text} />
        <Rows
          data={generateTimeSlots(handlePress)}
          textStyle={styles.text}
        />
      </Table>
      <PincodePopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        onSubmit={handlePincodeSubmit}
      />
    </View>
  );
}

function generateDates() {
  const dates = [];
  const startOfWeek = moment().startOf('week').add(1, 'days');
  for (let i = 0; i < 14; i++) {
    dates.push(startOfWeek.clone().add(i, 'days').format('MMM DD'));
  }
  return dates;
}

function generateTimeSlots(handlePress: (time: string, date: string) => void) {
  const slots: JSX.Element[][] = [];
  const times = ['07:00 - 13:00', '13:00 - 20:00'];

  times.forEach((time) => {
    const row = [<Text style={styles.timeText} key={time}>{time}</Text>];
    for (let i = 0; i < 14; i++) {
      const date = moment().startOf('week').add(1, 'days').add(i, 'days').format('MMM DD');
      row.push(
        <Pressable
          key={`${time}-${i}`}
          style={styles.cell}
          onPress={() => handlePress(time, date)}
        >
          <View style={styles.circle} />
        </Pressable>
      );
    }
    slots.push(row);
  });

  return slots;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 55, backgroundColor: '#f1f8ff' },
  text: { margin: 6, textAlign: 'center' },
  timeText: {
    margin: 6,
    textAlign: 'center',
    fontSize: 16,
  },
  cell: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    margin: 4,
  },
  circle: {
    width: '80%',
    height: '80%',
    borderRadius: 30,
    backgroundColor: 'green',
  },
});
