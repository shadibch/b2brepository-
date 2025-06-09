import i18n from 'i18next';
import axiosInstance from '../components/axiosInstance';
// Local variable to hold the current language
let language = i18n.language || 'en'; // Default to 'en' if the language is not set

export const t = (key, options) => i18n.t(key, options);

const supportedLanguages = ['en_US', 'ar_SA'];

export const switchLanguage = (lang) => {
  console.log("Switched to ", lang);

  i18n.changeLanguage(lang);
  if(localStorage.getItem("authToken"))
    axiosInstance.post('/api/updatelanguage/', { language: lang });
    
  
};

export const isRTL = () => {
  return !i18n.language || i18n.language.startsWith("ar"); // ✅ Returns true if the language starts with 'ar'
};

export const getCurrentLanguage = () => i18n.language || 'ar'; // ✅ Add a helper method to retrieve the current language
export const formatNumber = (value, currency) => {

  const options = currency
    ? { style: 'currency', currency: currency }
    : {}; // For plain numbers, omit currency options
  return new Intl.NumberFormat(getCurrentLanguage(), options).format(value);
};



export const formatLocal = (value) => {
  return new Intl.NumberFormat(getCurrentLanguage()).format(value);
  
}


export const formatDate = (date, locale = getCurrentLanguage()) => {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};