import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import da from './da.json';
import sv from './sv.json';
import en from './en.json';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const lang = await AsyncStorage.getItem('preferredLanguage');
      callback(lang || 'da');
    } catch {
      callback('da');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('preferredLanguage', lng);
    } catch {}
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      da: { translation: da },
      sv: { translation: sv },
      en: { translation: en },
    },
    fallbackLng: 'da',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
