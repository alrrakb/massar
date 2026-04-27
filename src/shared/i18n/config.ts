import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enDashboard from './locales/en/dashboard.json';
import arDashboard from './locales/ar/dashboard.json';
import enCommon from './locales/en/common.json';
import arCommon from './locales/ar/common.json';
import enUsers from './locales/en/users.json';
import arUsers from './locales/ar/users.json';
import enContent  from './locales/en/content.json';
import arContent  from './locales/ar/content.json';
import enSecurity from './locales/en/security.json';
import arSecurity from './locales/ar/security.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        dashboard: enDashboard,
        common: enCommon,
        users: enUsers,
        content: enContent,
        security: enSecurity,
      },
      ar: {
        dashboard: arDashboard,
        common: arCommon,
        users: arUsers,
        content: arContent,
        security: arSecurity,
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18n_lang',
    },
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'dashboard',
  });

export default i18n;
