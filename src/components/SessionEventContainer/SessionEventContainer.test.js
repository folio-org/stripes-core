import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import ms from 'ms';

import Harness from '../../../test/jest/helpers/harness';
import SessionEventContainer, {
  otherWindowActivity,
  otherWindowStorage,
  thisWindowActivity,
  thisWindowRtrError,
  thisWindowRtrIstTimeout,
} from './SessionEventContainer';
import {
  setUnauthorizedPathToSession,
  SESSION_NAME,
} from '../../loginServices';
import { RTR_TIMEOUT_EVENT } from '../Root/constants';

import { toggleRtrModal } from '../../okapiActions';

jest.mock('./KeepWorkingModal', () => (() => <div>KeepWorkingModal</div>));
jest.mock('../../loginServices');

const stripes = {
  config: {
    useSecureTokens: true,
    rtr: {
      idleModalTTL: '3s',
      idleSessionTTL: '3s',
      activityEvents: ['right thing', 'hustle', 'hand jive']
    }
  },
  okapi: {
    isAuthenticated: true,
  },
  logger: { log: jest.fn() },
  store: { dispatch: jest.fn() },
};

describe('SessionEventContainer', () => {
  it('Renders nothing if useSecureTokens is false', async () => {
    const insecureStripes = {
      config: {
        useSecureTokens: false,
      },
    };
    render(<Harness stripes={insecureStripes}><SessionEventContainer /></Harness>);

    expect(screen.queryByText('KeepWorkingModal')).toBe(null);
  });

  it('Shows a modal when idle timer expires', async () => {
    render(<Harness stripes={stripes}><SessionEventContainer /></Harness>);

    await waitFor(() => {
      screen.getByText('KeepWorkingModal', { timeout: ms(stripes.config.rtr.idleModalTTL) });
    });

    // expect(stripes.store.dispatch).toHaveBeenCalledWith(expect.any(String));
  });

  it('Dispatches logout when modal timer expires', async () => {
    const dispatchEvent = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => { });
    render(<Harness stripes={stripes}><SessionEventContainer /></Harness>);

    await waitFor(() => {
      expect(dispatchEvent).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});


describe('SessionEventContainer event listeners', () => {
  it('thisWindowRtrError', async () => {
    const history = { push: jest.fn() };

    const setUnauthorizedPathToSessionMock = setUnauthorizedPathToSession;
    setUnauthorizedPathToSessionMock.mockReturnValue(null);

    thisWindowRtrError(null, { okapi: { url: 'http' } }, history);
    expect(setUnauthorizedPathToSession).toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith('/logout-timeout');
  });

  it('thisWindowRtrIstTimeout', async () => {
    const s = {
      okapi: {
        url: 'http'
      },
      store: {},
      logger: {
        log: jest.fn(),
      }
    };

    const history = { push: jest.fn() };

    thisWindowRtrIstTimeout(null, s, history);
    expect(history.push).toHaveBeenCalledWith('/logout-timeout');
  });

  describe('otherWindowStorage', () => {
    beforeEach(() => {
      localStorage.removeItem(SESSION_NAME);
    });

    it('timeout', async () => {
      const e = { key: RTR_TIMEOUT_EVENT };
      const s = {
        okapi: {
          url: 'http'
        },
        store: {},
        logger: {
          log: jest.fn(),
        }
      };
      const history = { push: jest.fn() };

      otherWindowStorage(e, s, history);
      expect(history.push).toHaveBeenCalledWith('/logout-timeout');
    });

    it('logout', async () => {
      const e = { key: '' };
      const s = {
        okapi: {
          url: 'http'
        },
        store: {},
        logger: {
          log: jest.fn(),
        }
      };
      const history = { push: jest.fn() };

      otherWindowStorage(e, s, history);
      expect(history.push).toHaveBeenCalledWith('/logout');
    });
  });

  it('otherWindowActivity', () => {
    const m = { key: '' };
    const okapi = {
      url: 'http',
      rtrModalIsVisible: true,
    };
    const s = {
      okapi,
      store: {
        dispatch: jest.fn(),
        getState: () => ({ okapi }),
      },
      logger: {
        log: jest.fn(),
      }
    };
    const signal = jest.fn();
    const timers = {
      current: {
        timer: { signal },
      }
    };
    const setIsVisible = jest.fn();

    otherWindowActivity(m, s, timers, setIsVisible);

    expect(signal).toHaveBeenCalled();
    expect(setIsVisible).toHaveBeenCalledWith(false);
    expect(s.store.dispatch).toHaveBeenCalledWith(expect.objectContaining(toggleRtrModal(false)));
  });

  describe('thisWindowActivity', () => {
    it('pings when modal is hidden', () => {
      const e = { key: '' };
      const okapi = {
        url: 'http',
        rtrModalIsVisible: false,
      };
      const s = {
        okapi,
        store: {
          dispatch: jest.fn(),
          getState: () => ({ okapi }),
        },
        logger: {
          log: jest.fn(),
        }
      };
      const signal = jest.fn();
      const timers = {
        current: {
          timer: { signal },
        }
      };
      const postMessage = jest.fn();
      const broadcastChannel = {
        postMessage,
      };

      thisWindowActivity(e, s, timers, broadcastChannel);

      expect(signal).toHaveBeenCalled();
      expect(postMessage).toHaveBeenCalled();
    });

    it('does not ping when modal is visible', () => {
      const e = { key: '' };
      const okapi = {
        url: 'http',
        rtrModalIsVisible: true,
      };
      const s = {
        okapi,
        store: {
          dispatch: jest.fn(),
          getState: () => ({ okapi }),
        },
        logger: {
          log: jest.fn(),
        }
      };
      const signal = jest.fn();
      const timers = {
        current: {
          timer: { signal },
        }
      };
      const postMessage = jest.fn();
      const broadcastChannel = {
        postMessage,
      };

      thisWindowActivity(e, s, timers, broadcastChannel);

      expect(signal).not.toHaveBeenCalled();
      expect(postMessage).not.toHaveBeenCalled();
    });
  });
});
