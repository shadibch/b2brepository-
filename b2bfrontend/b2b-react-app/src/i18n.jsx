// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import ar from './locales/ar/translation.json'; // <-- ADD THIS

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar }, // <-- ADD THIS
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
const language = 'en';
export default i18n;
