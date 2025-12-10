import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import ru from './locales/ru.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import th from './locales/th.json';
import uk from './locales/uk.json';

// Create a new I18n instance
const i18n = new I18n({
  en,
  de,
  fr,
  it,
  ru,
  pt,
  es,
  hi,
  id,
  th,
  uk,
});

// Get device locale (e.g., "en-US" -> "en", "de-DE" -> "de")
const deviceLocale = getLocales()[0]?.languageCode || 'en';

// Set the locale once at the beginning of your app
i18n.locale = deviceLocale;

// Enable fallback to another language if translation is missing
i18n.enableFallback = true;

// Set default fallback language to English
i18n.defaultLocale = 'en';

export default i18n;
