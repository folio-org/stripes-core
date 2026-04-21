import ms from 'ms';

import { RTRError } from './Errors';

export const RTR_LOCK_KEY = '@folio/stripes-core::RTR_LOCK_KEY';
const RTR_RETRY_DELAY = ms('1s');
const RTR_MAX_ATTEMPTS = 2;

const getErrorMessages = (err) => {
  const directMessage = err?.message || '';
  const causeMessage = err?.cause?.message || '';
  return `${directMessage} ${causeMessage}`.toLowerCase();
};

// Retry only short-lived transport/timeout failures; do not retry semantic authn failures.
export const isRecoverableRTRError = (err) => {
  const messages = getErrorMessages(err);

  return messages.includes('timed out') ||
    messages.includes('failed to fetch') ||
    messages.includes('network request failed') ||
    messages.includes('networkerror') ||
    messages.includes('fetch failed') ||
    messages.includes('load failed');
};

/**
 * rotateAndReplay
 * rotateAndReplay is called when a response has a 4xx code and if it looks
 * like an authentication problem, rotate the tokens, replay the original
 * request, and resolve with that response. If rotation does not happen (there
 * are many possible reasons, detailed below), reject with the original response.
 * If there are any errors related to rotation itself, report them via a callback
 * and then reject with the original response.
 *
 * 1. inspect the response and the config to determine if rotation is needed.
 *    reject if any of the following are true:
 *    * we have a response but its code is not one we handle
 *    * the original request was configured with an `ignoreRtr` option
 *    * the config's shouldRotate() function returned false
 * 2. get an exclusive, browser-level lock, to avoid multiple tabs/windows
 *    attempting to rotate simultaneously. the lock takes an async function
 *    and releases when the promise settles. within that promise, rotate.
 *    if the rotation succeeds, replay the request and return the response.
 *
 * Inside the lock, the rotation process looks like this:
 * 1. Check storage to see if the token is still expired. When several requests
 *    fire together and then fail together, they'll queue up due to the browser
 *    lock. Once the first promise resolves, we can use its tokens for the
 *    remaining queued requests. This means that failed requests become
 *    single-threaded since they're all stuck here, waiting for the lock. Alas.
 * 2. Race a rejecting promise against the rotation request. We don't want
 *    to wait forever!
 * 3. Storage callback: update the token-expiration data in storage (so the
 *    next queued request can retrieve it in Step 1).
 * 4. Replay the original request and return its response.
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
   * 1. getTokens: maybe another request has already rotated
   * 2. rotate: race the rotation request with a rejecting timeout
   * 3. callback: store updated token details
   * 4. replay: replay the original request
   *
   * @returns promise response from the original request
   */
  const rotateTokens = async () => {
    config.logger.log('rtr', 'locked ...');
    for (let attempt = 1; attempt <= RTR_MAX_ATTEMPTS; attempt++) {
      //
      // 1. if rotation completed elsewhere, we don't need to rotate!
      // maybe another tab rotated, maybe it happened while awaiting the lock.
      if (await config.isValidToken()) {
        config.logger.log('rtr', 'reusing token supplied by another request');
        return replayRequest();
      }

      const timeout = config.refreshTimeout || ms('30s');
      let rejectId = null;

      try {
        //
        // 2. rotate: race the rotation-request with a timeout; default 30s
        const refreshTimeout = new Promise((_res, rej) => {
          rejectId = setTimeout(() => {
            rej(new RTRError(`Token refresh timed out after ${ms(timeout)}`));
          }, timeout);
        });

        config.logger.log('rtr', `===> rotating (attempt ${attempt}/${RTR_MAX_ATTEMPTS}) ...`);
        const t = await Promise.race([
          refreshTimeout,
          config.rotate()
        ]);
        config.logger.log('rtr', '<=== rotated!');

        //
        // 3. callback
        await config.onSuccess(t);
        config.logger.log('rtr', 'stored updated expiry ...');

        //
        // 4. replay the original request
        return replayRequest();
      } catch (err) {
        const shouldRetry = attempt < RTR_MAX_ATTEMPTS && isRecoverableRTRError(err);

        if (shouldRetry) {
          config.logger.log('rtr', 'recoverable RTR error, retrying once ...', err);
          await new Promise((resolve) => setTimeout(resolve, RTR_RETRY_DELAY));
          continue;
        }

        // Ruhroh, Raggy, rotation railed!
        // Report the failure via the provided callback. Reject with the original
        // response if available, allowing it to bubble to the caller. Otherwise,
        // rethrow, i.e. reject with the object we just caught.
        config.logger.log('rtr', 'RTR error!', err);
        await config.onFailure(err);
        if (error?.response) {
          throw error;
        }
        throw err;
      } finally {
        if (rejectId) {
          clearTimeout(rejectId);
        }
      }
    }

    return Promise.resolve();
  };

  // rotation config
  const shouldRotate = config.shouldRotate ?? (() => Promise.resolve(false));
  const statusCodes = config.statusCodes || [401];


  // shouldRotate() forces rotation when it returns true. If false,
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

  // lock, then rotate
  // default lock-mode is exclusive, preventing others from entering the lock
  // until this lock resolves (writer/readers pattern)
  if (navigator?.locks?.request) {
    return navigator.locks.request(RTR_LOCK_KEY, rotateTokens);
  } else {
    return rotateTokens();
  }
};
