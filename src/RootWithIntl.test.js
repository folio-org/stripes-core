/* shhhh, eslint, it's ok. we need "unused" imports for mocks */
/* eslint-disable no-unused-vars */

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { Redirect as InternalRedirect } from 'react-router-dom';
import Redirect from './components/Redirect';
import { Login } from './components';
import PreLoginLanding from './components/PreLoginLanding';

import {
  renderLoginComponent,
  renderLogoutComponent
} from './RootWithIntl';

jest.mock('react-router-dom', () => ({
  Redirect: () => '<internalredirect>',
  withRouter: (Component) => Component,
}));
jest.mock('./components/Redirect', () => () => '<redirect>');
jest.mock('./components/Login', () => () => '<login>');
jest.mock('./components/PreLoginLanding', () => () => '<preloginlanding>');

describe('RootWithIntl', () => {
  describe('renderLoginComponent', () => {
    it('handles legacy login', () => {
      const stripes = { okapi: {}, config: {} };
      render(renderLoginComponent(stripes));

      expect(screen.getByText(/<login>/)).toBeInTheDocument();
    });

    describe('handles third-party login', () => {
      it('handles single-tenant', () => {
        const stripes = {
          okapi: { authnUrl: 'https://barbie.com' },
          config: { isSingleTenant: true }
        };
        render(renderLoginComponent(stripes));

        expect(screen.getByText(/<redirect>/)).toBeInTheDocument();
      });

      it('handles multi-tenant', () => {
        const stripes = {
          okapi: { authnUrl: 'https://oppie.com' },
          config: { },
        };
        render(renderLoginComponent(stripes));

        expect(screen.getByText(/<preloginlanding>/)).toBeInTheDocument();
      });
    });
  });

  describe('renderLogoutComponent', () => {
    it('handles legacy logout', () => {
      const stripes = { okapi: {}, config: {} };
      render(renderLogoutComponent(stripes));

      expect(screen.getByText(/<internalredirect>/)).toBeInTheDocument();
    });

    it('handles third-party logout', () => {
      const stripes = {
        okapi: { authnUrl: 'https://oppie.com' },
        config: { confirmLogout: true },
      };
      render(renderLogoutComponent(stripes));

      expect(screen.getByText(/<redirect>/)).toBeInTheDocument();
    });
  });
});
