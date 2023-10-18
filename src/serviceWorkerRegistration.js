/* eslint no-console: 0 */

/**
 * registerSW
 * * register SW
 * * send SW the Okapi URL.
 * * listen for messages sent from SW
 * Note that although normally a page must be reloaded after a service worker
 * has been installed in order for the page to be controlled, this one
 * immediately claims control. Otherwise, no RTR would occur until after a
 * reload.
 *
 * @param {object} okapi config object
 * @param {function} callback function to call when receiving any message
 * @return void
 */
export const registerServiceWorker = async (okapiConfig, config) => {
  if ('serviceWorker' in navigator) {
    try {
      let sw = null;
      //
      // register
      //
      const registration = await navigator.serviceWorker.register(new URL('./service-worker.js', window.location.origin), { scope: './' })
        .then(reg => {
          return reg.update();
        });
      if (registration.installing) {
        sw = registration.installing;
        logger.log('rtr', 'Service worker installing');
      } else if (registration.waiting) {
        sw = registration.waiting;
        logger.log('rtr', 'Service worker installed');
      } else if (registration.active) {
        sw = registration.active;
        logger.log('rtr', 'Service worker active');
      }

      //
      // send SW okapi config details and a logger.
      // the corresponding listener is configured in App.js in order for it
      // to recieve some additional config values (i.e. the redux store)
      // which are necessary for processing failures (so we can clear out
      // said store on logout).
      //
      if (sw) {
        logger.log('rtr', 'sending OKAPI_CONFIG');
        sw.postMessage({ source: '@folio/stripes-core', type: 'OKAPI_CONFIG', value: okapiConfig });
        logger.log('rtr', 'sending LOGGER', logger);
        sw.postMessage({ source: '@folio/stripes-core', type: 'LOGGER', value: { categories: config.logCategories } });
      } else {
        console.error('(rtr) service worker not available');
      }
    } catch (error) {
      console.error(`(rtr) service worker registration failed with ${error}`);
    }

    // talk to me, goose
    if (navigator.serviceWorker.controller) {
      logger.log('rtr', 'This page is currently controlled by: ', navigator.serviceWorker.controller);
    }
    navigator.serviceWorker.oncontrollerchange = () => {
      logger.log('rtr', 'This page is now controlled by: ', navigator.serviceWorker.controller);
    };
  }
};

export const unregisterServiceWorker = async () => {
  console.log('unregister');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
};
