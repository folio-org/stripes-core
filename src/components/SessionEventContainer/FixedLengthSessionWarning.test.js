import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import ms from 'ms';

import Harness from '../../../test/jest/helpers/harness';
import FixedLengthSessionWarning from './FixedLengthSessionWarning';
import { timestampFormatter } from './utils';
import { RTR_TIME_MARGIN } from '../Root/constants';

jest.mock('../Root/token-util');

const stripes = {
  config: {
    rtr: {
      fixedLengthSessionWarningTTL: '99s'
    }
  }
};

describe('FixedLengthSessionWarning', () => {
  it('renders a warning with seconds remaining', async () => {
    render(<Harness stripes={stripes}><FixedLengthSessionWarning /></Harness>);
    screen.getByText(/stripes-core.rtr.fixedLengthSession.timeRemaining/);
    screen.getByText(
      new RegExp(timestampFormatter(ms(stripes.config.rtr.fixedLengthSessionWarningTTL) - ms(RTR_TIME_MARGIN)))
    );
  });

  it('renders 0:00 when time expires', async () => {
    const zeroSecondsStripes = {
      config: {
        rtr: {
          fixedLengthSessionWarningTTL: '0s'
        }
      }
    };

    render(<Harness stripes={zeroSecondsStripes}><FixedLengthSessionWarning /></Harness>);
    screen.getByText(/stripes-core.rtr.fixedLengthSession.timeRemaining/);
    screen.getByText(
      new RegExp(timestampFormatter(ms(stripes.config.rtr.fixedLengthSessionWarningTTL) - ms(RTR_TIME_MARGIN)))
    );
  });

  // I've never had great luck with jest's fake timers, https://jestjs.io/docs/timer-mocks
  // The modal counts down one second at a time so this test just waits for
  // two seconds. Great? Nope. Good enough? Sure is.
  describe('uses timers', () => {
    it('"like sand through an hourglass, so are the elapsed seconds of this warning" -- Soh Kraits', async () => {
      jest.spyOn(global, 'setInterval');
      const zeroSecondsStripes = {
        config: {
          rtr: {
            fixedLengthSessionWarningTTL: '10s'
          }
        }
      };

      render(<Harness stripes={zeroSecondsStripes}><FixedLengthSessionWarning /></Harness>);

      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);

      await waitFor(() => screen.getByText(
        new RegExp(timestampFormatter(ms(stripes.config.rtr.fixedLengthSessionWarningTTL) - ms(RTR_TIME_MARGIN)))
      ), { timeout: 2000 });
    });
  });
});
