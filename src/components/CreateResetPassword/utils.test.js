import { getTenant } from './utils';

describe('CreateResetPassword utils', () => {
  describe('getTenant', () => {
    const searchTenant = 'searchTenant';
    const okapiTenant = 'okapiTenant';

    const stripes = {
      okapi: { tenant: okapiTenant },
    };

    it('should return tenant value from location ?search when defined', () => {
      expect(getTenant(stripes, { search: `?tenant=${searchTenant}` })).toBe(searchTenant);
      expect(getTenant(stripes, { search: `tenant=${searchTenant}` })).toBe(searchTenant);
    });

    it('should return tenant value from okapi when location search is empty', () => {
      expect(getTenant(stripes, { search: '' })).toBe(okapiTenant);
      expect(getTenant(stripes, { search: undefined })).toBe(okapiTenant);
      expect(getTenant(stripes, { search: null })).toBe(okapiTenant);
    });
  });
});
