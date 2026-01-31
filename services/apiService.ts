import axios from 'axios';
import React, { useState } from 'react';
import * as Location from 'expo-location';

import { API_KEY } from '@env';

// Define the base URL for your API
const apiClient = axios.create({
    baseURL: 'https://localhost:44329/api',
    timeout: 1000,
    headers: {
    'Authorization': `Bearer supersecretkey`}
});

export const getPincodeData = async (pincode: number, apartmentNumber: number) => {
    try {
        const response = await apiClient.get(`/MobileUser/pincode/${pincode}`, {
            params: { apartmentNumber }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching pincode data:', error);
        throw error;
    }
};


// const getLocation = async () => {
//     let { status } = await Location.requestForegroundPermissionsAsync();
    
//     if (status !== 'granted') {
//       setErrorMsg('Permission to access location was denied');
//       return;
//     }

//     // Get the current location
//     let currentLocation = await Location.getCurrentPositionAsync({});
//     setLocation(currentLocation);
// };

// export const getWeatherData = async () => {
//     const location = getLocation();
//     // if location is error message then return error message
//    //return location
// };


export const getWeatherData = async () => {

    const location = await getLocation();
    const { latitude, longitude } = location.coords;
  
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;
  
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'YourAppName/1.0 (your.email@example.com)',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  };

  export const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
    }
    return await Location.getCurrentPositionAsync({});
};

export const reportLostAndFound = async (
    photoUri: string,
    description: string,
    buildingId: string,
    onProgress?: (progress: number) => void
) => {
    const formData = new FormData();
    formData.append('buildingId', buildingId);
    if (description) {
        formData.append('description', description);
    }

    const filename = photoUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
        uri: photoUri,
        name: filename,
        type,
    } as any);

    const response = await apiClient.post('/lost-found', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
        },
    });
    return response.data;
};