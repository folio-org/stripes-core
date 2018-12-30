/**
 * Is RTL helper
 *
 * Detects if a locale needs RTL direction in the browser
 */

import rightToLeftLocales from './RTL-locales';

const isRTL = locale => rightToLeftLocales.indexOf(locale) >= 0;

export default isRTL;
