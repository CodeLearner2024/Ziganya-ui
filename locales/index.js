import fr from './en.json';
import en from './fr.json';
import rn from './rn.json';

const translations = {
  fr,
  en,
  rn
};

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${language}`);
      return key; // Retourne la clé si la traduction n'est pas trouvée
    }
  }
  
  return value;
};

export const getAvailableLanguages = () => {
  return Object.keys(translations).map(code => ({
    code,
    name: translations[code].languageName || code
  }));
};

export default translations;