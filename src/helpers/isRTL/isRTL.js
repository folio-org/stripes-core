/**
 * Is RTL helper
 *
 * Detects if a locale needs RTL direction in the browser
 */

import rightToLeftLocales from './RTL-locales';

const isRTL = locale => {
  // Locales will in some cases be formed like e.g. "ar-AR"
  // But we only need the first part to check for RTL locales
  const cleanLocale = locale.indexOf('-') >= 0 ? locale.split('-')[0] : locale;
console.warn('clearn locale', cleanLocale);
  return rightToLeftLocales.indexOf(cleanLocale) >= 0;
};

export default isRTL;
