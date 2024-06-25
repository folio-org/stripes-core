/* shhhh, eslint, it's ok. we need "unused" imports for mocks */
/* eslint-disable no-unused-vars */

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { Router as DefaultRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Login from './components/Login';
import MainNav from './components/MainNav';
import MainContainer from './components/MainContainer';
import ModuleContainer from './components/ModuleContainer';
import RootWithIntl from './RootWithIntl';
import Stripes from './Stripes';

jest.mock('./components/Login', () => () => '<Login>');
jest.mock('./components/MainNav', () => () => '<MainNav>');
jest.mock('./components/ModuleContainer', () => () => '<ModuleContainer>');
jest.mock('./components/MainContainer', () => ({ children }) => children);

const defaultHistory = createMemoryHistory();

const Harness = ({
  Router = DefaultRouter,
  children,
  history = defaultHistory,
}) => {
  return (
    <Router history={history}>
      {children}
    </Router>
  );
};

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
  it('renders login without one of (isAuthenticated, token, disableAuth)', async () => {
    const stripes = new Stripes({ epics: {}, logger: {}, bindings: {}, config: {}, store, discovery: { isFinished: false } });
    await render(<Harness><RootWithIntl stripes={stripes} history={defaultHistory} isAuthenticated={false} /></Harness>);

    expect(screen.getByText(/<Login>/)).toBeInTheDocument();
    expect(screen.queryByText(/<MainNav>/)).toBeNull();
  });

  describe('renders MainNav', () => {
    it('given isAuthenticated', async () => {
      const stripes = new Stripes({ epics: {}, logger: {}, bindings: {}, config: {}, store, discovery: { isFinished: false } });
      await render(<Harness><RootWithIntl stripes={stripes} history={defaultHistory} isAuthenticated /></Harness>);

      expect(screen.queryByText(/<Login>/)).toBeNull();
      expect(screen.queryByText(/<MainNav>/)).toBeInTheDocument();
    });

    it('given token', async () => {
      const stripes = new Stripes({ epics: {}, logger: {}, bindings: {}, config: {}, store, discovery: { isFinished: false } });
      await render(<Harness><RootWithIntl stripes={stripes} history={defaultHistory} token /></Harness>);

      expect(screen.queryByText(/<Login>/)).toBeNull();
      expect(screen.queryByText(/<MainNav>/)).toBeInTheDocument();
    });

    it('given disableAuth', async () => {
      const stripes = new Stripes({ epics: {}, logger: {}, bindings: {}, config: {}, store, discovery: { isFinished: false } });
      await render(<Harness><RootWithIntl stripes={stripes} history={defaultHistory} disableAuth /></Harness>);

      expect(screen.queryByText(/<Login>/)).toBeNull();
      expect(screen.queryByText(/<MainNav>/)).toBeInTheDocument();
    });
  });

  describe('renders ModuleContainer', () => {
    it('if config.okapi is not an object', async () => {
      const stripes = new Stripes({ epics: {}, logger: {}, bindings: {}, config: {}, store, discovery: { isFinished: true } });
      await render(<Harness><RootWithIntl stripes={stripes} history={defaultHistory} isAuthenticated /></Harness>);

      expect(screen.getByText(/<ModuleContainer>/)).toBeInTheDocument();
    });

    it('if discovery is finished', async () => {
      const stripes = new Stripes({ epics: {}, logger: {}, bindings: {}, config: {}, store, okapi: {}, discovery: { isFinished: true } });
      await render(<Harness><RootWithIntl stripes={stripes} history={defaultHistory} isAuthenticated /></Harness>);

      expect(screen.getByText(/<ModuleContainer>/)).toBeInTheDocument();
    });
  });
});
