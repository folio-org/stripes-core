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
export const registerServiceWorker = async (okapiConfig, logger) => {
  if ('serviceWorker' in navigator) {
    try {
      let sw = null;

      //
      // register
      //
      const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: './' })
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
      // send SW an OKAPI_URL message
      //
      if (sw) {
        logger.log('rtr', '<= sending OKAPI_URL', sw);
        sw.postMessage({ source: '@folio/stripes-core', type: 'OKAPI_CONFIG', value: okapiConfig });
        logger.log('rtr', '<= sending LOGGER');
        sw.postMessage({ source: '@folio/stripes-core', type: 'LOGGER', value: logger });
      } else {
        console.error('SW NOT AVAILABLE');
      }
    } catch (error) {
      console.error(`=> Registration failed with ${error}`);
    }

    //
    // listen for messages
    // the only message we expect to receive tells us that RTR happened
    // so we need to update our expiration timestamps
    //
    // navigator.serviceWorker.addEventListener('message', (e) => {
    //   console.info('<= reading', e.data);
    //   if (e.data.type === 'TOKEN_EXPIRATION') {
    //     // @@ store.setItem is async but we don't care about the response
    //     store.setItem('tokenExpiration', e.data.tokenExpiration);
    //     console.log(`atExpires ${e.data.tokenExpiration.atExpires}`);
    //     console.log(`rtExpires ${e.data.tokenExpiration.rtExpires}`);
    //   }
    // });

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
