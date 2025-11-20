import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../locales';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key) => {
    return getTranslation(language, key);
  };

  return {
    t,
    language
  };
};