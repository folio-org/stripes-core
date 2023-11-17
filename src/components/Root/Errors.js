/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */

/**
 * RTRError
 * Error occured during rotation
 */
export class RTRError extends Error {
  constructor(message) {
    super(message ?? 'Unknown Refresh Token Error');

    this.name = 'RTRError';
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
