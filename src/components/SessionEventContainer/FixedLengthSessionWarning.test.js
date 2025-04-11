import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import FixedLengthSessionWarning from './FixedLengthSessionWarning';

jest.mock('../Root/token-util');

describe('FixedLengthSessionWarning', () => {
  it('renders a warning with seconds remaining', async () => {
    render(<FixedLengthSessionWarning timeRemainingMillis={99000} />);
    screen.getByText(/stripes-core.rtr.fixedLengthSession.timeRemaining/);
    screen.getByText(/01:39/);
  });

  it('renders 0:00 when time expires', async () => {
    render(<FixedLengthSessionWarning timeRemainingMillis={0} />);
    screen.getByText(/stripes-core.rtr.fixedLengthSession.timeRemaining/);
    screen.getByText(/0:00/);
  });

  // I've never had great luck with jest's fake timers, https://jestjs.io/docs/timer-mocks
  // The modal counts down one second at a time so this test just waits for
  // two seconds. Great? Nope. Good enough? Sure is.
  describe('uses timers', () => {
    it('"like sand through an hourglass, so are the elapsed seconds of this warning" -- Soh Kraits', async () => {
      render(<FixedLengthSessionWarning timeRemainingMillis={10000} />);

      await waitFor(() => screen.getByText(/00:10/));
    });
  });
});
