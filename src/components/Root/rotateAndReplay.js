/* eslint-disable import/prefer-default-export */

/**
 * TLDR: override global `fetch` and `XMLHttpRequest` to perform RTR for
 * FOLIO API requests.
 *
 * RTR Primers:
 * @see https://authjs.dev/guides/basics/refresh-token-rotation
 * @see https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
 *
 * Our AT and RT live in HTTP-only cookies, so the JS code doesn't have access
 * to them. The AT cookie accompanies every request, and the RT cookie is sent
 * only in refresh requests.
 *
 * The basic plot is to trap failed API requests and inspect the reason for
 * failure. If it was an authentication failure, stash the request, rotate the
 * tokens, then replay the original request. If the request failed for other
 * reasons, allow that failure to bubble to the calling application. If the
 * rotation request itself fails, that indicates we have no AT and no RT; this
 * is an unrecoverable situation and the session is terminated.
 *
 *
 * Logging categories:
 *   rtr: rotation
 *   rtrv: verbose
 *
 */

import ms from 'ms';

export const RTR_LOCK_KEY = '@folio/stripes-core::RTR_LOCK_KEY';

/**
 * rotateAndReplay
 * 1. queue the original request
 * 2. rotate tokens
 * 3. replay the original request now that tokens are fresh
 *
 * @param {*} fetchfx fetch function to execute
 * @param {*} config rotation configuration
 * @param {*} error failed request { response, resource, options }
 *
 * @returns response of the replayed request
 */
export const rotateAndReplay = async (fetchfx, config, error) => {
  config.logger.log('rtr', 'queueRotateReplay...', config);

  const replayRequest = async () => {
    config.logger.log('rtr', 'replaying ...', error.resource);
    const response = await fetchfx.apply(global, [error.resource, config.options(error.options)]);
    return response;
  };

  /**
   * rotateTokens
   * 1. getTokens: maybe another request has already rotated
   * 2. rotate: race the rotation request with a rejecting timeout
   * 3. callback: store updated token details
   * 4. replay: replay the original request
   *
   * @returns promise response from the original request
   */
  const rotateTokens = async () => {
    config.logger.log('rtr', 'locked ...');
    try {
      // config.logger.log('===> rtr waiting')
      // await new Promise((res, rej) => {
      //   setTimeout(res, 5000);
      // });
      // config.logger.log('<=== rtr waited')

      //
      // 1. if rotation completed elsewhere, we don't need to rotate!
      // maybe another tab rotated, maybe it happened while awaiting the lock.
      if (await config.isValidToken()) {
        config.logger.log('rtr', 'reusing token supplied by another request');
        return replayRequest();
      }

      //
      // 2. rotate: race the rotation-request with a timeout; default 30s
      const refreshTimeout = new Promise((_res, rej) => {
        const timeout = config.refreshTimeout || ms('30s');
        setTimeout(() => {
          rej(new Error(`Token refresh timed out after ${ms(timeout)}`));
        }, timeout);
      });

      config.logger.log('===> rotating ...');
      const t = await Promise.race([
        refreshTimeout,
        config.rotate()
      ]);
      config.logger.log('<=== rotated!');

      //
      // 3. callback
      await config.onSuccess(t);
      config.logger.log('rtr', 'rotated ...');

      //
      // 4. replay the original request
      return replayRequest();
    } catch (err) {
      config.logger.log('rtr', 'RTR error!', err);
      await config.onFailure(err);

      // return the original response
      return Promise.reject(error);
    }
  };

  // rotation config
  const shouldRotate = await config.shouldRotate ?? (() => Promise.resolve(true));
  const statusCodes = config.statusCodes || [401];

  // skip rotation if:
  // 1. we have a failed response but its status code does not indicate an authn failure
  // 3. the original request asked to ignore rtr
  // 4. we were asked not to rotate
  if ((error.response && !statusCodes.includes(error.response.status)) ||
    error.options?.rtrIgnore ||
    !await shouldRotate()
  ) {
    return Promise.reject(error);
  }

  // pause users requests, giving us time to complete RTR in another window,
  // proving that when simulateous requests fire, they correctly lock each
  // other out, and when the second returns, it reuses the token from the first
  // if (error.resource.match(/users/)) {
  //   config.logger.log('===> users waiting')
  //   await new Promise((res, rej) => {
  //     setTimeout(res, 5000);
  //   });
  //   config.logger.log('<=== users waited')
  // }

  // lock, then rotate
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(RTR_LOCK_KEY, rotateTokens);
  } else {
    return rotateTokens();
  }
};
