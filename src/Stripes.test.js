import Stripes from './Stripes';

describe('Stripes', () => {
  describe('clone', () => {
    it('returns a matching copy', () => {
      const s = new Stripes();
      const c = s.clone();
      expect(s).toEqual(c);
    });

    it('returns a matching copy plus additional properties', () => {
      const s = new Stripes();
      const c = s.clone({ monkey: 'bagel' });

      expect(c).toMatchObject(s);
      expect(c).toHaveProperty('monkey', 'bagel');
    });
  });

  describe('hasInterface', () => {
    describe('returns truthy', () => {
      it('when the interface is present and the query does not contain a version [boolean, true]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger, discovery: { interfaces: { 'monkey': '3.0' } } });
        expect(s.hasInterface('monkey')).toBe(true);
        expect(logger.log).toHaveBeenCalledWith('interface', 'interface \'monkey\' exists');
      });

      it('when the interface is present and compatible with the requested version [string, available interface]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger, discovery: { interfaces: { 'monkey': '3.0' } } });
        expect(s.hasInterface('monkey', '3.0')).toBe('3.0');
        expect(logger.log).toHaveBeenCalled();
      });
    });

    describe('returns falsy', () => {
      it('when the interface is present but incompatible with the requested version [number, 0]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger, discovery: { interfaces: { 'monkey': '3.0' } } });
        expect(s.hasInterface('monkey', '4.0')).toBe(0);
        expect(logger.log).toHaveBeenCalled();
      });

      it('when `discovery` is unavailable [undefined]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger });
        expect(s.hasInterface('monkey')).toBeUndefined();
        expect(logger.log).toHaveBeenCalled();
      });

      it('when `discovery.interfaces` is unavailable [undefined]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger, discovery: {} });
        expect(s.hasInterface('monkey')).toBeUndefined();
        expect(logger.log).toHaveBeenCalled();
      });

      it('when the requested interface is absent [undefined]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger, discovery: { interfaces: { 'funky': '3.0' } } });
        expect(s.hasInterface('monkey')).toBeUndefined();
        expect(logger.log).toHaveBeenCalledWith('interface', 'interface \'monkey\' is missing');
      });
    });
  });

  describe('hasPerm', () => {
    describe('returns true', () => {
      it('given hasAllPerms', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger, config: { hasAllPerms: true } });
        expect(s.hasPerm('monkey')).toBe(true);
        expect(logger.log).toHaveBeenCalledWith('perm', 'assuming perm \'monkey\': hasAllPerms is true');
      });

      it('when requested permissions are assigned', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({
          logger,
          user: {
            perms: {
              'monkey': true, 'bagel': true, 'funky': true, 'chicken': true
            }
          }
        });
        expect(s.hasPerm('monkey,bagel')).toBe(true);
        expect(logger.log).toHaveBeenCalledWith('perm', 'checking perm \'monkey,bagel\': ', true);
      });
    });

    describe('returns falsy', () => {
      it('when requested permissions are not assigned [boolean, false]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({
          logger,
          user: {
            perms: { 'monkey': true, 'bagel': true }
          }
        });
        expect(s.hasPerm('monkey,funky')).toBe(false);
        expect(logger.log).toHaveBeenCalledWith('perm', 'checking perm \'monkey,funky\': ', false);
      });

      it('when user perms are uninitialized [undefined]', () => {
        const logger = { log: jest.fn() };
        const s = new Stripes({ logger, user: {} });
        expect(s.hasPerm('monkey')).toBeUndefined();
        expect(logger.log).toHaveBeenCalledWith('perm', 'not checking perm \'monkey\': no user permissions yet');
      });
    });
  });

  describe('reset', () => {
    it('restores config and logger to default values', () => {
      const logger = { log: jest.fn() };
      const s = new Stripes({ logger, config: { funky: 'chicken' } });
      s.reset();
      expect(s.config).toMatchObject({});
      expect(s.logger.categories).toEqual('core,action,xhr');
      expect(s.logger.prefix).toEqual('stripes');
      expect(s.logger.timestamp).toBe(false);
    });
  });
});
