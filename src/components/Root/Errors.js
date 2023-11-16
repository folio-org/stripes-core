/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

/**
 * RTRError
 * Error occured during rotation
 */
export class RTRError extends Error {
  constructor(response) {
    // Set the message to the status text, such as Unauthorized,
    // with some fallbacks. This message should never be undefined.
    super(
      response.statusText ||
      String(
        (response.status === 0 || response.status) ?
          response.status : 'Unknown Refresh Token Error'
      )
    );
    this.name = 'RTRError';
    this.response = response;
  }
}

/**
 * UnexpectedResourceError
 * Thrown when
 */
export class UnexpectedResourceError extends Error {
  constructor(resource) {
    super('Expected a string, URL, or Request but did not receive one.');

    this.name = 'UnexpectedResourceError';
    this.resource = resource;
  }
}
