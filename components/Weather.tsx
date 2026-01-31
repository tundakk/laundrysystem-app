import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getWeatherData } from '../services/apiService';

export default function Weather() {
  const [weather, setWeather] = useState<any>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('white');
  const [weatherKey, setWeatherKey] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData();
        setWeather(data);
        console.log('Weather Data:', data);
        const condition = data?.properties?.timeseries[0]?.data?.next_1_hours?.summary?.symbol_code;
        console.log('Condition:', condition);
        if (condition.includes('fair_day')) {
          setBackgroundColor('lightyellow');
          setWeatherKey('weather.fairDay');
        } else if (condition.includes('rain')) {
          setBackgroundColor('blue');
          setWeatherKey('weather.raining');
        } else if (condition.includes('cloudy')) {
          setBackgroundColor('gray');
          setWeatherKey('weather.gloomy');
        } else if (condition.includes('clearsky_night')) {
          setBackgroundColor('darkblue');
          setWeatherKey('weather.clearNight');
        } else if (condition.includes('clearsky_day')) {
          setBackgroundColor('lightblue');
          setWeatherKey('weather.clearDay');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchWeather();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text>{weatherKey ? t(weatherKey) : ''}</Text>
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
