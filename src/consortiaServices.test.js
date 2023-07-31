import {
  checkIfUserInCentralTenant,
  checkIfUserInMemberTenant,
  checkIfSharedRecord,
  checkIfLocalRecord,
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

  describe('checkIfSharedRecord', () => {
    describe('when source contains the `CONSORTIUM-` prefix', () => {
      it('should return true', () => {
        const source = 'CONSORTIUM-FOLIO';
        const stripes = {};

        expect(checkIfSharedRecord(stripes, source)).toBeTruthy();
      });
    });

    describe('when the user is in the central tenant', () => {
      it('should return true', () => {
        const source = 'FOLIO';
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

        expect(checkIfSharedRecord(stripes, source)).toBeTruthy();
      });
    });
  });

  describe('checkIfLocalRecord', () => {
    describe('when the source is either `FOLIO` or `MARC` and the user is in a member tenant', () => {
      it('should return true', () => {
        const source = 'FOLIO';
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

        expect(checkIfLocalRecord(stripes, source)).toBeTruthy();
      });
    });
  });
});
