import { render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';

import TitleManager from './TitleManager';
import Harness from '../../../test/jest/helpers/harness';

describe('TitleManager', () => {
  it('renders a title with a default postfix', async () => {
    const stripes = {
      config: {},
      hasPerm: jest.fn(),
    };

    const page = 'record-application';

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <TitleManager page={page}>
          <>thunder - chicken</>
        </TitleManager>
      </Harness>
    );

    await waitFor(() => expect(document.title).toBe(`${page} - FOLIO`));
  });

  it('renders prefix, page, record, postfix', async () => {
    const stripes = {
      config: {
        platformName: 'two mile',
      },
      hasPerm: jest.fn(),
    };

    const prefix = 'pre';
    const page = 'steve';
    const record = '8:41.5';

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <TitleManager page={page} prefix={prefix} record={record}>
          <>thunder - chicken</>
        </TitleManager>
      </Harness>
    );

    await waitFor(() => expect(document.title).toBe(`${prefix}${page} - ${record} - ${stripes.config.platformName}`));
  });


  it('renders prefix, record, postfix', async () => {
    const stripes = {
      config: {
        platformName: 'two mile',
      },
      hasPerm: jest.fn(),
    };

    const prefix = 'pre';
    const record = '8:41.5';

    const history = createMemoryHistory();
    render(
      <Harness history={history} stripes={stripes}>
        <TitleManager prefix={prefix} record={record}>
          <>thunder - chicken</>
        </TitleManager>
      </Harness>
    );

    await waitFor(() => expect(document.title).toBe(`${prefix}${record} - ${stripes.config.platformName}`));
  });
});
