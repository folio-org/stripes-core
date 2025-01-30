import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';

import { getLocationQuery } from '../../locationService';
import CreateResetPasswordControl from './CreateResetPasswordControl';

jest.mock('../OrganizationLogo');

jest.mock('../../locationService', () => ({
  getLocationQuery: jest.fn()
}));

describe('CreateResetPasswordControl', () => {
  const mockFetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve({ test: 100 }),
  }));

  const stripes = {
    clone: jest.fn(),
    config: {},
    okapi: {
      authnUrl: 'http://test'
    },
    hasInterface: jest.fn().mockReturnValue(true),
    store: {
      getState: () => ({
        okapi: {
          token: '123',
        },
      }),
      dispatch: () => {},
      subscribe: () => {},
      replaceReducer: () => {},
    }
  };

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('uses reset token in URL param', async () => {
    getLocationQuery.mockReturnValue({ resetToken: '123' });

    const history = createMemoryHistory();

    render(
      <Provider store={stripes.store}>
        <Router history={history}>
          <CreateResetPasswordControl stripes={stripes} />
        </Router>
      </Provider>
    );

    expect(mockFetch.mock.lastCall[1].headers['x-okapi-token'] === '123').toBeTruthy();
  });
});
