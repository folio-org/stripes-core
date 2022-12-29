jest.mock('stripes-config', () => (
  {
    branding: {
      style: {},
    },
    config: {},
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
