export class SessionSyncError extends Error {
  constructor(resource) {
    super('Session sync failed.');

    this.name = 'SessionSyncError';
    this.resource = resource;
  }
}

