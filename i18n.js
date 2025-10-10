import * as Localization from "expo-localization";
import i18n from "i18n-js";

// Import des fichiers de langue
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import rn from "./locales/rn.json";

// Charger les traductions
i18n.translations = {
  fr,
  en,
  rn,
};

// Définir la langue par défaut
i18n.locale = Localization.locale.split("-")[0]; // ex. "fr" à partir de "fr-FR"
i18n.fallbacks = true;

export default i18n;
