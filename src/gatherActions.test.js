import gatherActions from './gatherActions';

// Mock the entitlement service instead of stripes-config
jest.mock('./entitlementService', () => ({
  getModules: jest.fn(() => Promise.resolve({
    a: { a: { module: 'a', actionNames: ['alice', 'andrew'] } },
    b: { b: { module: 'b', actionNames: ['bea', 'bea'] } },
    c: { c: { module: 'c' } },
  })),
}));

describe('gatherActions', () => {
  it('gathers actions from modules', async () => {
    const response = await gatherActions();
    expect(response).toContain('alice');
    expect(response).toContain('andrew');
    expect(response).toContain('bea');
  });
});
