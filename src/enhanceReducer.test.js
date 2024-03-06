import enhanceReducer from './enhanceReducer';

describe('enhanceReducer', () => {
  const reducer = (state) => (state);

  it('provides RESET_STORE', () => {
    let state = {
      monkey: 'bagel',
      okapi: true,
      discovery: true,
    };
    state = enhanceReducer(reducer)(state, { type: 'RESET_STORE' });
    expect(state.monkey).toBeUndefined();
    expect(state.okapi).toBeTruthy();
    expect(state.discovery).toBeTruthy();
  });

  it('provides DESTROY_STORE', () => {
    let state = {
      monkey: 'bagel',
      okapi: true,
      discovery: true,
    };
    state = enhanceReducer(reducer)(state, { type: 'DESTROY_STORE' });
    expect(state.monkey).toBeUndefined();
    expect(state.okapi).toMatchObject({});
    expect(state.discovery).toBeUndefined();
  });

  it('passes through other actions', () => {
    let state = { monkey: 'bagel' };
    state = enhanceReducer(reducer)(state, { type: 'foo' });
    expect(state).toMatchObject(state);
  });
});
