import {
  checkIfUserInCentralTenant,
  checkIfUserInMemberTenant,
} from './consortiaServices';

describe('consortiaServices', () => {
  describe('checkIfUserInCentralTenant', () => {
    describe('when consortia interface is not available', () => {
      it('should return false', () => {
        const stripes = {
          hasInterface: jest.fn().mockReturnValue(false),
        };

        expect(checkIfUserInCentralTenant(stripes)).toBeFalsy();
      });
    });

    describe('when tenant matches central tenant id', () => {
      it('should return true', () => {
        const stripes = {
          hasInterface: jest.fn().mockReturnValue(true),
          okapi: {
            tenant: 'consortia',
          },
          user: {
            user: {
              consortium: {
                centralTenantId: 'consortia',
              },
            },
          },
        };

        expect(checkIfUserInCentralTenant(stripes)).toBeTruthy();
      });
    });

    describe('when tenant does not match central tenant id', () => {
      it('should return false', () => {
        const stripes = {
          hasInterface: jest.fn().mockReturnValue(true),
          okapi: {
            tenant: 'university',
          },
          user: {
            user: {
              consortium: {
                centralTenantId: 'consortia',
              },
            },
          },
        };

        expect(checkIfUserInCentralTenant(stripes)).toBeFalsy();
      });
    });
  });

  describe('checkIfUserInMemberTenant', () => {
    describe('when consortia interface is not available', () => {
      it('should return false', () => {
        const stripes = {
          hasInterface: jest.fn().mockReturnValue(false),
        };

        expect(checkIfUserInMemberTenant(stripes)).toBeFalsy();
      });
    });

    describe('when tenant matches central tenant id', () => {
      it('should return false', () => {
        const stripes = {
          hasInterface: jest.fn().mockReturnValue(true),
          okapi: {
            tenant: 'consortia',
          },
          user: {
            user: {
              consortium: {
                centralTenantId: 'consortia',
              },
            },
          },
        };

        expect(checkIfUserInMemberTenant(stripes)).toBeFalsy();
      });
    });

    describe('when tenant does not match central tenant id', () => {
      it('should return true', () => {
        const stripes = {
          hasInterface: jest.fn().mockReturnValue(true),
          okapi: {
            tenant: 'university',
          },
          user: {
            user: {
              consortium: {
                centralTenantId: 'consortia',
              },
            },
          },
        };

        expect(checkIfUserInMemberTenant(stripes)).toBeTruthy();
      });
    });
  });
});
