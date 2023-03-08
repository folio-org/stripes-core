jest.mock('stripes-config', () => (
  {
    branding: {
      style: {},
    },
    metadata: {},
    modules: [],
    okapi: {
      tenant: 'okapiTenant',
      token: 'okapiToken',
      url: 'okapiUrl',
    },
    translations: [],
  }
),
{ virtual: true });
