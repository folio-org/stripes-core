/* shhhh, eslint, it's ok. we need "unused" imports for mocks */
/* eslint-disable no-unused-vars */

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { Redirect as InternalRedirect } from 'react-router-dom';
import Redirect from '../Redirect';
import Login from '../Login';
import PreLoginLanding from '../PreLoginLanding';

import {
  setUnauthorizedTenantToSession,
  getUnauthorizedPathFromSession,
} from '../../loginServices';

import AuthnLogin from './AuthnLogin';

jest.mock('react-router-dom', () => ({
  Redirect: () => '<internalredirect>',
  withRouter: (Component) => Component,
}));
jest.mock('../Redirect', () => () => '<redirect>');
jest.mock('../Login', () => () => '<login>');
jest.mock('../PreLoginLanding', () => () => '<preloginlanding>');

jest.mock('../../loginServices', () => ({
  ...jest.requireActual('../../loginServices'),
  setUnauthorizedTenantToSession: jest.fn(),
  getUnauthorizedPathFromSession: jest.fn(),
  setUnauthorizedPathToSession: jest.fn(),
  getOIDCRedirectUri: jest.fn().mockReturnValue('encoded-redirect-uri'),
}));

const store = {
  getState: () => ({
    okapi: {
      token: '123',
    },
  }),
  dispatch: jest.fn(),
  subscribe: () => {},
  replaceReducer: () => {},
};

describe('RootWithIntl', () => {
  describe('AuthnLogin', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('handles legacy login', () => {
      const stripes = { okapi: {}, config: {}, store };
      render(<AuthnLogin stripes={stripes} />);

      expect(screen.getByText(/<login>/)).toBeInTheDocument();
    });

    describe('handles third-party login', () => {
      it('handles single-tenant', () => {
        const stripes = {
          okapi: { authnUrl: 'https://barbie.com' },
          config: {
            isSingleTenant: true,
            tenantOptions: {
              diku: { name: 'diku', clientId: 'diku-application' }
            }
          },
          store
        };
        render(<AuthnLogin stripes={stripes} />);

        expect(screen.getByText(/<redirect>/)).toBeInTheDocument();
      });

      it('handles multi-tenant', () => {
        const stripes = {
          okapi: { authnUrl: 'https://oppie.com' },
          config: {
            isSingleTenant: false,
            tenantOptions: {
              diku: { name: 'diku', clientId: 'diku-application' },
              diku2: { name: 'diku2', clientId: 'diku2-application' }
            }
          },
          store
        };
        render(<AuthnLogin stripes={stripes} />);

        expect(screen.getByText(/<preloginlanding>/)).toBeInTheDocument();
      });
    });

    describe('setTenant', () => {
      it('saves tenant to session when authnUrl is set and no unauthorized path is stored', () => {
        getUnauthorizedPathFromSession.mockReturnValue(null);

        const stripes = {
          okapi: { authnUrl: 'https://barbie.com' },
          config: {
            tenantOptions: {
              diku: { name: 'diku', clientId: 'diku-application' }
            }
          },
          store
        };
        render(<AuthnLogin stripes={stripes} />);

        expect(setUnauthorizedTenantToSession).toHaveBeenCalledWith('diku');
      });

      it('does not overwrite session tenant when an unauthorized path is already stored', () => {
        getUnauthorizedPathFromSession.mockReturnValue('/some-path');

        const stripes = {
          okapi: { authnUrl: 'https://barbie.com' },
          config: {
            tenantOptions: {
              diku: { name: 'diku', clientId: 'diku-application' }
            }
          },
          store
        };
        render(<AuthnLogin stripes={stripes} />);

        expect(setUnauthorizedTenantToSession).not.toHaveBeenCalled();
      });

      it('does not save tenant to session for legacy login (no authnUrl)', () => {
        const stripes = { okapi: {}, config: {}, store };
        render(<AuthnLogin stripes={stripes} />);

        expect(setUnauthorizedTenantToSession).not.toHaveBeenCalled();
      });
    });
  });
});
