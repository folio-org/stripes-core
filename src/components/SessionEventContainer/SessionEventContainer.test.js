import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import createInactivityTimer from 'inactivity-timer';
import { createRef } from 'react';


import Harness from '../../../test/jest/helpers/harness';
import SessionEventContainer from './SessionEventContainer';
import { getTokenExpiry } from '../../loginServices';

jest.mock('./KeepWorkingModal', () => (() => <div>KeepWorkingModal</div>));


const stripes = {
  config: {
    rtr: {
      idleModalTTL: '3s',
      idleSessionTTL: '3s',
    }
  },
  okapi: {
    isAuthenticated: true,
  },
  logger: { log: jest.fn() },
  store: { dispatch: jest.fn() },
};

describe('KeepWorkingModal', () => {
  it('Shows a modal when idle timer expires', async () => {
    const idleTimers = createRef();
    render(<Harness stripes={stripes}><SessionEventContainer idleTimers={idleTimers} /></Harness>);

    await waitFor(() => {
      screen.getByText('KeepWorkingModal', { timeout: 3000 });
    });

    expect(stripes.logger.log).toHaveBeenCalledTimes(1);
    expect(stripes.store.dispatch).toHaveBeenCalledTimes(1);
  });

  it('Dispatches logout when modal timer expires', async () => {
    const dispatchEvent = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => { });

    const idleTimers = createRef();
    render(<Harness stripes={stripes}><SessionEventContainer idleTimers={idleTimers} /></Harness>);

    await waitFor(() => {
      expect(dispatchEvent).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});
