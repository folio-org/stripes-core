import gatherActions from './gatherActions';

jest.mock('stripes-config', () => ({
  modules: {
    a: { a: { module: 'a', actionNames: ['alice', 'andrew'] } },
    b: { b: { module: 'b', actionNames: ['bea', 'bea'] } },
    c: { c: { module: 'c' } },
  },
}));

describe('gatherActions', () => {
  it('gathers actions from modules', () => {
    const response = gatherActions();
    expect(response).toContain('alice');
    expect(response).toContain('andrew');
    expect(response).toContain('bea');
  });
});
