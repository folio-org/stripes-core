import getUserTenantsPermissions from './getUserTenantsPermissions';

const mockFetch = jest.fn();

describe('getUserTenantsPermissions', () => {
  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('X-Okapi-Token header is present if present in stripes', async () => {
    const stripes = {
      user: { user: { id: 'userId' } },
      okapi: {
        url: 'http://okapiUrl',
        token: 'elevensies',
      },
      hasInterface: jest.fn(),
    };
    mockFetch.mockResolvedValueOnce('non-okapi-success');

    await getUserTenantsPermissions(stripes, ['tenantId']);
    await expect(mockFetch.mock.calls).toHaveLength(1);

    expect(mockFetch.mock.lastCall[0]).toMatch(/[stripes.okapi.url]/);
    expect(mockFetch.mock.lastCall[1]).toMatchObject({
      headers: {
        'X-Okapi-Tenant': 'tenantId'
      }
    });
  });

  it('X-Okapi-Token header is absent if absent from stripes', async () => {
    const stripes = {
      user: { user: { id: 'userId' } },
      okapi: {
        url: 'http://okapiUrl',
      },
      hasInterface: jest.fn(),
    };
    mockFetch.mockResolvedValueOnce('non-okapi-success');

    await getUserTenantsPermissions(stripes, ['tenantId']);
    await expect(mockFetch.mock.calls).toHaveLength(1);

    expect(mockFetch.mock.lastCall[0]).toMatch(/[stripes.okapi.url]/);
    expect(mockFetch.mock.lastCall[1].headers.keys).toEqual(expect.not.arrayContaining(['X-Okapi-Token']));
  });

  it('response aggregates permissions across tenants', async () => {
    const stripes = {
      user: { user: { id: 'userId' } },
      okapi: {
        url: 'http://okapiUrl',
      },
      hasInterface: jest.fn(),
    };

    const t1 = { p: ['t1-p1', 't1-p2'] };
    const t2 = { p: ['t2-p3', 't2-p4'] };

    mockFetch
      .mockResolvedValueOnce(Promise.resolve({ json: () => Promise.resolve(t1) }))
      .mockResolvedValueOnce(Promise.resolve({ json: () => Promise.resolve(t2) }));

    const response = await getUserTenantsPermissions(stripes, ['t1', 't2']);

    expect(response[0]).toMatchObject(t1);
    expect(response[1]).toMatchObject(t2);
  });
});
