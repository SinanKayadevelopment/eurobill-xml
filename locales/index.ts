import { de } from "./de";
import { en } from "./en";
import { fr } from "./fr";

export type Language = "de" | "en" | "fr";

export const translations = {
  de,
  en,
  fr,
};

export const getTranslation = (lang: Language) => {
  return translations[lang] || translations.de;
};

