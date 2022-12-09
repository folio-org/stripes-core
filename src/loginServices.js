import localforage from 'localforage';

import {
  setCurrentServicePoint,
  setUserServicePoints,
  updateCurrentUser,
} from './okapiActions';

// export supported numbering systems, i.e. the systems tenants may chose
// for numeral display
export const supportedNumberingSystems = [
  'latn',  // Arabic (0 1 2 3 4 5 6 7 8 9)
  'arab',  // Arabic-Hindi (٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩)
];

// export supported locales, i.e. the languages we provide translations for
export const supportedLocales = [
  'ar',     // arabic
  'cs-CZ',  // czech, czechia
  'da-DK',  // danish, denmark
  'de-DE',  // german, germany
  'en-GB',  // british english
  'en-SE',  // english, sweden
  'en-US',  // american english
  'es-419', // latin american spanish
  'es-ES',  // european spanish
  'es',     // spanish
  'fr-FR',  // french, france
  'he',     // hebrew
  'hi-IN',  // hindi, india
  'hu-HU',  // hugarian, hungry
  'it-IT',  // italian, italy
  'ja',     // japanese
  'ko',     // korean
  'nb',     // norwegian bokmål"
  'nn',     // norwegian nynorsk
  'pl',     // polish
  'pt-BR',  // portuguese, brazil
  'pt-PT',  // portuguese, portugal
  'ru',     // russian
  'sv',     // swedish
  'ur',     // urdu
  'zh-CN',  // chinese, china
  'zh-TW',  // chinese, taiwan
];

// export config values for storing user locale
export const userLocaleConfig = {
  'configName': 'localeSettings',
  'module': '@folio/stripes-core',
};

/**
 * setCurServicePoint
 * 1. store the given service-point as the current one in locale storage,
 * 2. dispatch the current service-point
 * @param {redux store} store
 * @param {object} servicePoint
 *
 * @returns {Promise}
 */
export function setCurServicePoint(store, servicePoint) {
  return localforage.getItem('okapiSess')
    .then((sess) => {
      sess.user.curServicePoint = servicePoint;
      return localforage.setItem('okapiSess', sess);
    })
    .then(() => {
      store.dispatch(setCurrentServicePoint(servicePoint));
    });
}

/**
 * setServicePoints
 * 1. store the given list in locale storage,
 * 2. dispatch the list of service-points
 * @param {redux store} store redux store
 * @param {Array} servicePoints
 *
 * @returns {Promise}
 */
export function setServicePoints(store, servicePoints) {
  return localforage.getItem('okapiSess')
    .then((sess) => {
      sess.user.servicePoints = servicePoints;
      return localforage.setItem('okapiSess', sess);
    })
    .then(() => {
      store.dispatch(setUserServicePoints(servicePoints));
    });
}

/**
 * updateUser
 * 1. concat the given data onto local-storage user and save it
 * 2. dispatch updateCurrentUser, concating given data onto the session user
 * @param {redux-store} store redux store
 * @param {object} data
 *
 * @returns {Promise}
 */
export function updateUser(store, data) {
  return localforage.getItem('okapiSess')
    .then((sess) => {
      sess.user = { ...sess.user, ...data };
      return localforage.setItem('okapiSess', sess);
    })
    .then(() => {
      store.dispatch(updateCurrentUser(data));
    });
}
