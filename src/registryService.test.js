import {
  register,
  requestRegistryElement,
  requestRegistryLink,
  resetRegistry,
} from './registryService';

describe('registryService', () => {
  beforeEach(() => {
    resetRegistry();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  it('returns undefined for an unregistered type', () => {
    expect(requestRegistryElement('user')).toBeUndefined();
    expect(requestRegistryLink('user')).toBeUndefined();
  });

  it('registers and retrieves a single entry', () => {
    register({ type: 'user', link: '/users/view/:id' });

    expect(requestRegistryLink('user')).toBe('/users/view/:id');
    expect(requestRegistryElement('user', 'link')).toBe('/users/view/:id');
  });

  it('accepts an array of entries', () => {
    register([
      { type: 'user', link: '/users/view/:id' },
      { type: 'item', link: '/inventory/view/:id' },
    ]);

    expect(requestRegistryLink('user')).toBe('/users/view/:id');
    expect(requestRegistryLink('item')).toBe('/inventory/view/:id');
  });

  it('returns undefined for a registered type missing the requested field', () => {
    register({ type: 'user', link: '/users/view/:id' });

    expect(requestRegistryElement('user', 'findPlugin')).toBeUndefined();
  });

  it('returns the entire bucket when field is omitted', () => {
    register({ type: 'user', link: '/users/view/:id', card: 'UserCard' });

    expect(requestRegistryElement('user')).toEqual({ link: '/users/view/:id', card: 'UserCard' });
  });

  it('merges fields registered separately under the same type', () => {
    register({ type: 'user', link: '/users/view/:id' });
    register({ type: 'user', findPlugin: 'find-user' });

    expect(requestRegistryLink('user')).toBe('/users/view/:id');
    expect(requestRegistryElement('user', 'findPlugin')).toBe('find-user');
  });

  it('overwrites and warns when a field is re-registered with a different value', () => {
    register({ type: 'user', link: '/users/view/:id' });
    register({ type: 'user', link: '/patrons/view/:id' });

    expect(requestRegistryLink('user')).toBe('/patrons/view/:id');
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn when a field is re-registered with the same value', () => {
    register({ type: 'user', link: '/users/view/:id' });
    register({ type: 'user', link: '/users/view/:id' });

    expect(console.warn).not.toHaveBeenCalled();
  });
});
