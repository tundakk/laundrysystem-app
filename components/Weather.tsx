import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWeatherData } from '../services/apiService';

export default function Weather() {
  const [weather, setWeather] = useState<any>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('white');
  const [weatherText, setWeatherText] = useState<string>('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData();
        setWeather(data);
        console.log('Weather Data:', data);
        const condition = data?.properties?.timeseries[0]?.data?.next_1_hours?.summary?.symbol_code;
        console.log('Condition:', condition);
        // condition = 'clearsky_day';
        if (condition.includes('fair_day')) {
          setBackgroundColor('lightyellow');
          setWeatherText('It is a fair day!');
        } else if (condition.includes('rain')) {
          setBackgroundColor('blue');
          setWeatherText('It is raining!');
        } else if (condition.includes('cloudy')) {
          setBackgroundColor('gray');
          setWeatherText('What a gloomy day!');
        } else if (condition.includes('clearsky_night')) {
          setBackgroundColor('darkblue');
          setWeatherText('It is a clear night!');
        } else if (condition.includes('clearsky_day')) {
          setBackgroundColor('lightblue');
          setWeatherText('It is a clear day!');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchWeather();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text>{weatherText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
