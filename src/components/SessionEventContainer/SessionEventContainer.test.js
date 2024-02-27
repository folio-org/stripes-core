import { render } from '@folio/jest-config-stripes/testing-library/react';

import Harness from '../../../test/jest/helpers/harness';
import SessionEventContainer, {
  idleSessionWarningHandler,
  rtrSuccessHandler,
} from './SessionEventContainer';
import { getTokenExpiry } from '../../loginServices';
import { EVENTS } from '../../constants';

const listen = jest.fn();
const emit = jest.fn();
const eventManagerMock = () => ({
  emit,
  listen,
  bc: {
    close: jest.fn(),
  }
});
jest.mock('../../loginServices', () => ({
  ...jest.requireActual('../../loginServices'),
  getTokenExpiry: () => Promise.resolve({
    rtExpires: Date.now() + 10000,
    atExpires: Date.now() + 10000,
  }),
  eventManager: eventManagerMock,
}));

describe('KeepWorkingModal', () => {
  it('renders with dates in the future', async () => {
    render(<Harness><SessionEventContainer /></Harness>);

    expect(listen).toHaveBeenCalledWith(EVENTS.AUTHN.IDLE_SESSION_WARNING, expect.any(Function));
    expect(listen).toHaveBeenCalledWith(EVENTS.AUTHN.RTR_SUCCESS, expect.any(Function));
    expect(listen).toHaveBeenCalledWith([
      EVENTS.AUTHN.IDLE_SESSION_TIMEOUT,
      EVENTS.AUTHN.RTR_ERROR,
      EVENTS.AUTHN.LOGOUT,
    ], expect.any(Function));
  });

  it('idleSessionWarningHandler', async () => {
    const stripes = {
      logger: {
        log: () => { },
      }
    };

    const mockGetTokenExpiry = getTokenExpiry();
    mockGetTokenExpiry.mockReturnValue = Promise.resolve();
    const setExpiry = jest.fn();
    const setIsVisible = jest.fn();

    idleSessionWarningHandler({ stripes, setExpiry, setIsVisible })
      .finally(() => {
        expect(setIsVisible).toHaveBeenCalledWith(true);
      });
  });

  describe('rtrSuccessHandler', () => {
    it('uses given expiration data when provided', async () => {
      const stripes = {
        logger: {
          log: () => { },
        }
      };

      const setIsVisible = jest.fn();
      const idleSessionTimer = {};
      const data = {
        rtExpires: 1000,
      };
      const idleSeconds = 0;
      window.Date.now = () => 0;
      window.setTimeout = jest.fn();

      rtrSuccessHandler({ stripes, setIsVisible, idleSessionTimer, data, emit, idleSeconds });
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });

    it('retrieves expiration data from storage when none is given', async () => {
      const stripes = {
        logger: {
          log: () => { },
        }
      };

      const setIsVisible = jest.fn();
      const idleSessionTimer = {};
      const data = {};
      const idleSeconds = 0;
      window.Date.now = () => 0;
      window.setTimeout = jest.fn();

      rtrSuccessHandler({ stripes, setIsVisible, idleSessionTimer, data, emit, idleSeconds })
        .finally(() => {
          expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
        });
    });
  });
});
