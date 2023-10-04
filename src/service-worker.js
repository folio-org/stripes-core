/* eslint no-console: 0 */

/* eslint no-restricted-globals: ["off", "self"] */


/** { atExpires, rtExpires } both are JS millisecond timestamps */
let tokenExpiration = null;

/** string FQDN including protocol, e.g. https://some-okapi.somewhere.org */
let okapiUrl = null;

/**
 * isValidAT
 * return true if tokenExpiration.atExpires is in the future
 * @returns boolean
 */
const isValidAT = () => {
  console.log(`=> at expires ${new Date(tokenExpiration?.atExpires).getTime()}`);
  return !!(tokenExpiration?.atExpires > Date.now());
};

/**
 * isValidRT
 * return true if tokenExpiration.rtExpires is in the future
 * @returns boolean
 */
const isValidRT = () => {
  console.log(`=> rt expires ${new Date(tokenExpiration?.rtExpires).getTime()}`);
  return !!(tokenExpiration?.rtExpires > Date.now());
};

/**
 * messageToClient
 * Send a message to clients of this service worker
 * @param {Event} event
 * @param {*} message
 * @returns void
 */
const messageToClient = async (event, message) => {
  // Exit early if we don't have access to the client.
  // Eg, if it's cross-origin.
  if (!event.clientId) {
    console.log('PASSTHROUGH: no clientId');
    return;
  }

  // Get the client.
  const client = await self.clients.get(event.clientId);
  // Exit early if we don't get the client.
  // Eg, if it closed.
  if (!client) {
    console.log('PASSTHROUGH: no client');
    return;
  }

  // Send a message to the client.
  console.log('=> sending', message);
  client.postMessage(message);
};

/**
 * rtr
 * exchange an RT for a new one.
 * Make a POST request to /authn/refresh, including the current credentials,
 * and send a TOKEN_EXPIRATION event to clients that includes the new AT/RT
 * expiration timestamps.
 * @param {Event} event
 * @returns Promise
 * @throws if RTR fails
 */
const rtr = (event) => {
  console.log('** RTR ...');
  return fetch(`${okapiUrl}/authn/refresh`, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }

      // rtr failure. return an error message if we got one.
      return res.json()
        .then(json => {
          if (json.errors[0]) {
            throw new Error(`${json.errors[0].message} (${json.errors[0].code})`);
          } else {
            throw new Error('RTR response failure');
          }
        });
    })
    .then(json => {
      console.log('**     success!');
      tokenExpiration = {
        atExpires: new Date(json.accessTokenExpiration).getTime(),
        rtExpires: new Date(json.refreshTokenExpiration).getTime(),
      };
      // console.log('REFRESH BODY', { tokenExpiration })
      messageToClient(event, { type: 'TOKEN_EXPIRATION', tokenExpiration });
    });
};


const isLoginRequest = (request) => {
  return request.url.includes('login-with-expiry');
};

const isRefreshRequest = (request) => {
  return request.url.includes('authn/refresh');
};

/**
 * isPermissibleRequest
 * Some requests are always permissible, e.g. auth-n and token-rotation.
 * Others are only permissible if the Access Token is still valid.
 * @param {} req
 * @returns
 */
const isPermissibleRequest = (req) => {
  return isLoginRequest(req) || isRefreshRequest(req) || isValidAT();
};

const isOkapiRequest = (req) => {
  return new URL(req.url).origin === okapiUrl;
};

/**
 * passThrough
 * Inspect event.request to determine whether it's an okapi request.
 * If it is, make sure its AT is valid or perform RTR before executing it.
 * If it isn't, execute it immediately.
 * @param {Event} event
 * @returns Promise
 * @throws if any fetch fails
 */
const passThrough = async (event) => {
  const req = event.request.clone();

  // okapi requests are subject to RTR
  if (isOkapiRequest(req)) {
    console.log('=> fetch', req.url);
    if (isPermissibleRequest(req)) {
      console.log('   (valid AT or authn request)');
      return fetch(event.request, { credentials: 'include' })
        .catch(e => {
          console.error(e);
          return Promise.reject(e);
        });
    }

    if (isValidRT()) {
      console.log('=>      valid RT');
      try {
        // we don't need the response from RTR, but we do need to await it
        // to make sure the AT included with the fetch has been refreshed
        await rtr(event);
        return fetch(event.request, { credentials: 'include' });
      } catch (e) {
        // console.error('passThrough fail', e)
        return Promise.reject(e);
      }
    }

    return Promise.reject(new Error('Invalid RT'));
  }

  // default: pass requests through to the network
  // console.log('passThrough NON-OKAPI', req.url)
  return fetch(event.request, { credentials: 'include' })
    .catch(e => {
      console.error(e);
      return Promise.reject(e);
    });
};

/**
 * install
 * on install, force this SW to be the active SW
 */
self.addEventListener('install', (event) => {
  console.info('=> install', event);
  return self.skipWaiting();
});

/**
 * activate
 * on activate, force this SW to control all in-scope clients,
 * even those that loaded before this SW was registered.
 */
self.addEventListener('activate', async (event) => {
  event.waitUntil(self.clients.claim());
});

// self.addEventListener('activate', async (event) => {
//   console.info('=> activate', event);
//   clients.claim();
//   // event.waitUntil(clients.claim());
// });

/**
 * eventListener: message
 * listen for messages from clients and dispatch them accordingly.
 * OKAPI_URL: store
 */
self.addEventListener('message', async (event) => {
  console.info('=> reading', event.data);
  if (event.data.type === 'OKAPI_URL') {
    okapiUrl = event.data.value;
  }

  if (event.data.type === 'TOKEN_EXPIRATION') {
    tokenExpiration = event.data.tokenExpiration;
  }
});

/**
 * eventListener: fetch
 * intercept fetches
 */
self.addEventListener('fetch', async (event) => {
  // const clone = event.request.clone();
  // console.log('=> fetch', clone.url)

  // console.log('=> fetch') // , clone.url)
  event.respondWith(passThrough(event));
});

