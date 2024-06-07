/* shhhh, eslint, it's ok. we need "unused" imports for mocks */
/* eslint-disable no-unused-vars */

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { Redirect as InternalRedirect } from 'react-router-dom';
import Redirect from './components/Redirect';
import { Login } from './components';
import PreLoginLanding from './components/PreLoginLanding';

// import {
//   renderLogoutComponent
// } from './RootWithIntl';

import AuthnLogin from './components/AuthnLogin';

jest.mock('react-router-dom', () => ({
  Redirect: () => '<internalredirect>',
  withRouter: (Component) => Component,
}));
jest.mock('./components/Redirect', () => () => '<redirect>');
jest.mock('./components/Login', () => () => '<login>');
jest.mock('./components/PreLoginLanding', () => () => '<preloginlanding>');

const store = {
  getState: () => ({
    okapi: {
      token: '123',
    },
  }),
  dispatch: () => {},
  subscribe: () => {},
  replaceReducer: () => {},
};

describe('RootWithIntl', () => {
  describe('AuthnLogin', () => {
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
  });

  // describe('renderLogoutComponent', () => {
  //   it('handles legacy logout', () => {
  //     const stripes = { okapi: {}, config: {} };
  //     render(renderLogoutComponent(stripes));

  //     expect(screen.getByText(/<internalredirect>/)).toBeInTheDocument();
  //   });
  // });
});
