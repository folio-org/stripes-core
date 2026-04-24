import ms from 'ms';

import { RTRError } from './Errors';

export const RTR_LOCK_KEY = '@folio/stripes-core::RTR_LOCK_KEY';

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
 * 1. 👀 Inspect storage to see if the token is still expired. When several
 *    requests fire together and then fail together, they'll queue up to enter
 *    the lock and then proceed through it single-file. Although several
 *    requests may be queued, only the first one in the queue needs to perform
 *    rotation; the others can short-circuit straight to replay. Note, however,
 *    that deleting the AT cookie without updating the expiration-data in
 *    storage will lead to this check returning a stale response. In that
 *    situation, even the first request through the lock will also trigger the
 *    short-circuit to replay, but the replay will fail with a 401. Thus we
 *    check the replay's status here, and if it indicates an authentication
 *    failure we eject from the short-circuit and continue with rotation.
 * 2. 🔄 Race a rejecting promise against the rotation request. We don't want
 *    to wait forever!
 * 3. 💾 Storage callback: update the token-expiration data in storage (so the
 *    next queued request can retrieve it in Step 1).
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

  // rotation config
  const shouldRotate = config.shouldRotate ?? (() => Promise.resolve(false));
  const statusCodes = config.statusCodes || [401];

  /**
   * replayRequest
   * replay the error'ed request, if there is one. unlike FFetch which traps
   * and replays failed requests, FXHR simply checks for a valid token and
   * rotates if it does not have one. (Its send() method is void, so we don't
   * have an error-response to inspect.)
   *
   * @returns Promise
   */
  const replayRequest = async () => {
    if (error?.resource) {
      config.logger.log('rtr', 'replaying ...', error.resource);
      const response = await fetchfx.apply(globalThis, [error.resource, config.options(error.options)]);
      return response;
    }

    return Promise.resolve();
  };

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
      // Maybe another tab rotated, maybe it happened while awaiting the lock.
      // If this short-circuit-to-replay fails, however, that means our
      // assumption that rotation completed elsewhere was wrong and we need to
      // proceed with rotation.
      if (await config.isValidToken()) {
        config.logger.log('rtr', 'reusing token supplied by another request');
        const replayResponse = await replayRequest();
        if (!statusCodes.includes(replayResponse.status)) {
          return replayResponse;
        }
        config.logger.log('rtr', 'replay failed; forcing rotate ...');
      }

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
      return replayRequest();
    } catch (err) {
      // 💥 Ruhroh, Raggy, rotation railed!
      // Report the failure via the provided callback. Reject with the original
      // response if available, allowing it to bubble to the caller. Otherwise,
      // rethrow, i.e. reject with the object we just caught.
      config.logger.log('rtr', 'RTR error!', err);
      await config.onFailure(err);
      if (error.response) {
        throw error;
      }
      throw err;
    }
  };

  // 🧐 shouldRotate() forces rotation when it returns true. If false,
  // investigate the error response, allowing the error to bubble back to
  // the caller when:
  // 1. the response does not indicate an authn failure
  // 2. the original request had an `rtrIgnore` option
  if (!await shouldRotate(error?.response)) {
    if ((error?.response && !statusCodes.includes(error.response.status)) ||
      error?.options?.rtrIgnore
    ) {
      throw error;
    }
  }

  // 🔒 lock, then rotate
  // default lock-mode is exclusive, preventing others from entering the lock
  // until this lock resolves (writer/readers pattern)
  if (navigator?.locks?.request) {
    return navigator.locks.request(RTR_LOCK_KEY, rotateTokens);
  } else {
    return rotateTokens();
  }
};
