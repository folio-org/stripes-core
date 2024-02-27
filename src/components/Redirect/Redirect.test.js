import { render } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';

import Harness from '../../../test/jest/helpers/harness';
import Redirect from './Redirect';

describe('Redirect', () => {
  it('updates window.location with "replace"', () => {
    const to = 'http://monkeybagel.com/';

    const stripes = {
      config: {},
    };

    const history = createMemoryHistory();

    render(
      <Harness history={history} stripes={stripes}>
        <Redirect to={to} />
      </Harness>
    );

    expect(window.location).toBeAt(to);
    expect(window.location.replace).toHaveBeenCalled();
  });

  it('updates window.location with "assign"', () => {
    const to = 'http://monkeybagel.com/';

    const stripes = {
      config: {},
    };

    const history = createMemoryHistory();

    render(
      <Harness history={history} stripes={stripes}>
        <Redirect to={to} push />
      </Harness>
    );

    expect(window.location).toBeAt(to);
    expect(window.location.assign).toHaveBeenCalled();
  });
});
