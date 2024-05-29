import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import Harness from '../../../test/jest/helpers/harness';
import KeepWorkingModal from './KeepWorkingModal';

jest.mock('../Root/token-util');

const stripes = {
  config: {
    rtr: {
      idleModalTTL: '99s'
    }
  }
};

describe('KeepWorkingModal', () => {
  it('renders a modal with seconds remaining', async () => {
    render(<Harness stripes={stripes}><KeepWorkingModal /></Harness>);
    screen.getByText(/stripes-core.rtr.idleSession.timeRemaining/);
    screen.getByText(/01:39/);
  });

  it('renders 0:00 when time expires', async () => {
    const zeroSecondsStripes = {
      config: {
        rtr: {
          idleModalTTL: '0s'
        }
      }
    };

    render(<Harness stripes={zeroSecondsStripes}><KeepWorkingModal /></Harness>);
    screen.getByText(/stripes-core.rtr.idleSession.timeRemaining/);
    screen.getByText(/0:00/);
  });

  it('calls the callback', async () => {
    const callback = jest.fn();
    render(<Harness stripes={stripes}><KeepWorkingModal callback={callback} /></Harness>);
    await userEvent.click(screen.getByRole('button'));
    expect(callback).toHaveBeenCalled();
  });

  // I've never had great luck with jest's fake timers, https://jestjs.io/docs/timer-mocks
  // The modal counts down one second at a time so this test just waits for
  // two seconds. Great? Nope. Good enough? Sure is.
  describe('uses timers', () => {
    it('like sand through an hourglass, so are the elapsed seconds of this modal', async () => {
      jest.spyOn(global, 'setInterval');
      const zeroSecondsStripes = {
        config: {
          rtr: {
            idleModalTTL: '10s'
          }
        }
      };

      render(<Harness stripes={zeroSecondsStripes}><KeepWorkingModal /></Harness>);

      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);

      await waitFor(() => screen.getByText(/00:09/), { timeout: 2000 });
    });
  });
});
