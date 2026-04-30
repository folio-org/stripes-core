import ms from 'ms';

import { RTRError } from './Errors';

export const RTR_LOCK_KEY = '@folio/stripes-core::RTR_LOCK_KEY';

/**
 * Resources that **can be cloned usually **need to be cloned because they
 * can only be consumed once, e.g. Request and Response objects.
 * @param {object} resource
 * @returns a clone of the resource when it implements clone(), or the resource itself
 */
export const reusableResource = (resource) => {
  return (resource.clone) ? resource.clone() : resource;
};

/**
 * replayRequest
 * replay the error'ed request, if there is one. unlike FFetch which traps
 * and replays failed requests, FXHR checks for a valid token and invokes
 * rotation if it does not have one prior to calling `super.send()`.
 *
 * @returns Promise
 */
export const replayRequest = async (fetchfx, resource, options, config) => {
  if (resource) {
    config.logger.log('rtr', 'replaying ...');
    return fetchfx.apply(globalThis, [resource, options ?? {}]);
  }

  // XHR does not have a request to replay
  return undefined;
};

/**
 * rotateAndReplay
 *
 * IN SUMMARY
 *
 * rotateAndReplay is called when a request in FFetch returns a non-ok response.
 * Here, we inspect the request-options and response in detail and if it looks
 * like the problem was an expired (and therefore absent) AT cookie, rotate the
 * tokens and then replay the original request, returning the new response. If
 * the initial inspection fails (maybe we got a 404, which is a problem of
 * course but not an RTR problem), reject with the original response so it can
 * bubble back to the caller. If rotation itself fails, report the failure via
 * the config callback and then reject with the original response (if
 * available) or the rotation error.
 *
 * IN DETAIL
 *
 * 1. 🧐 inspect the response and the config to determine if rotation is needed.
 *    reject if any of the following are true:
 *    * we have a response but its code is not one we handle
 *    * the original request was configured with an `ignoreRtr` option
 *    * the config's shouldRotate() function returned false
 * 2. 🔒 get an exclusive, browser-level lock, to avoid multiple tabs/windows
 *    attempting to rotate simultaneously. the lock takes an async function
 *    and releases when the promise settles. within the lock's promise, rotate.
 *    if the rotation succeeds, replay the request and return the response.
 *
 * Inside the lock's promise, rotation looks like this:
 * 1. 👀 Immediately attempt to replay the request and observe the response.
 *    Multiple requests may fail simultaneously across multiple tabs, and all
 *    of them will be queued up to go through this lock single-file. In fact,
 *    only the first request needs to rotate. Once that first request travels
 *    through, performs rotation, and is replayed, the remaining requests in
 *    the queue can short-circuit the process, abandoning the queue and
 *    returning the replayed response without rotation. This means the first
 *    request through the queue suffers a performance penalty (an extra failed
 *    replay), but subsequent requests sail through more quickly. Feels like an
 *    okay tradeoff.
 * 2. 🔄 Race a rejecting promise against the rotation request. We don't want
 *    to wait forever!
 * 3. 💾 Storage callback: update the token-expiration data in storage.
 * 4. 🔂 Replay the original request and return its response.
 *
 * @param {*} fetchfx fetch function to execute
 * @param {*} config rotation configuration
 * @param {*} error failed request { response, resource, options }
 *
 * @returns On successful rotation, resolve with the response of the original
 * request. Otherwise, reject
 */
export const rotateAndReplay = async (fetchfx, config, error) => {
  config.logger.log('rtr', 'queueRotateReplay...', config);

  // rotation config defaults
  const shouldRotate = config.shouldRotate ?? (() => Promise.resolve(false));
  const ignoreRotate = config.ignoreRotate ?? (() => false);
  const statusCodes = config.statusCodes || [401];

  /**
   * rotateTokens
   * 1. inspect: maybe another request has already rotated
   * 2. rotate: race the rotation request with a rejecting timeout
   * 3. callback: store updated token details
   * 4. replay: replay the original request
   *
   * @returns promise response from the original request
   */
  const rotateTokens = async () => {
    config.logger.log('rtr', 'locked ...');
    try {
      //
      // 1. 👀 If rotation completed elsewhere, we don't need to rotate!
      // Replay the request and inspect the response for success. If it's ok,
      // we're done and can return that response. If it's not 2xx/ok, rotate
      // and then replay again.
      config.logger.log('rtr', 'reusing token supplied by another request');
      const resourceClone = reusableResource(error.resource);
      const replayedResponse = await replayRequest(fetchfx, resourceClone, error.options, config);
      if (replayedResponse?.ok) {
        return replayedResponse;
      }
      config.logger.log('rtr', 'replay failed; forcing rotate ...');

      //
      // 2. 🔄 rotate: race the rotation-request with a timeout; default 30s
      let rejectId = null;
      const refreshTimeout = new Promise((_res, rej) => {
        const timeout = config.refreshTimeout || ms('30s');
        rejectId = setTimeout(() => {
          rej(new RTRError(`Token refresh timed out after ${ms(timeout)}`));
        }, timeout);
      });

      config.logger.log('rtr', '===> rotating ...');
      const t = await Promise.race([
        refreshTimeout,
        config.rotate()
      ]);
      clearTimeout(rejectId);
      config.logger.log('rtr', '<=== rotated!');

      //
      // 3. 💾 callback: save new token-expiration value
      await config.onSuccess(t);
      config.logger.log('rtr', 'stored updated expiry ...');

      //
      // 4. 🔂 replay the original request
      return replayRequest(fetchfx, error.resource, error.options, config);
    } catch (err) {
      // 💥 Ruhroh, Raggy, rotation railed!
      // Report the failure via the provided callback. Reject with the original
      // response if available, allowing it to bubble to the caller. Otherwise,
      // rethrow, i.e. reject with the object we just caught.
      config.logger.log('rtr', 'RTR error!', err);
      await config.onFailure(err);
      // if we already have an RTRError, throw it. if we don't, wrap and throw
      // to make sure any catch clause is able to usefully interpret this
      if (err instanceof RTRError) {
        throw err;
      }

      throw new RTRError('RUHRO, RTR Error', { cause: err });
    }
  };

  // 🧐 ignoreRotate() prevents rotation when it returns true.
  if (ignoreRotate(error.options)) {
    return error.response;
  }

  // 🧐 shouldRotate() forces rotation when it returns true.
  // we also check status codes
  if (await shouldRotate(error?.response) || statusCodes.includes(error.response.status)) {
    // 🔒 lock, then rotate
    // default lock-mode is exclusive, preventing others from entering the lock
    // until this lock resolves (writer/readers pattern)
    return navigator.locks.request(RTR_LOCK_KEY, rotateTokens);
  }

  // 😢 awww nobody wanted to rotate; just give back the response we started with
  return error.response;
};


/**
 *
 * @param {*} fetchfx
 * @param {*} resource
 * @param {*} options
 * @param {*} config
 * @returns
 */
export const fetchWithRotate = async (fetchfx, resource, options, config) => {
  let response;
  // a fetch() resource can be either a string (which can be copied)
  // or a Request object (which can only be consumed once, and needs
  // to be cloned before it is used the first time in case this fetch
  // triggers rotation and it needs to be replayed.
  const resourceClone = reusableResource(resource);

  // readers/writer lock pattern: don't fetch while rotation is in-progress
  // https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
  response = await navigator.locks.request(RTR_LOCK_KEY, { mode: 'shared' }, async () => {
    return fetchfx.apply(globalThis, [resource, options]);
  });

  if (!response?.ok) {
    response = await rotateAndReplay(
      fetchfx,
      config,
      { response, resource: resourceClone, options }
    );
  }

  return response;
};
