import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import Harness from '../../../test/jest/helpers/harness';
import SessionEventContainer, {
  idleSessionWarningHandler,
  rtrSuccessHandler,
} from './SessionEventContainer';
import { eventManager, getTokenExpiry } from '../../loginServices';
import { CHANNELS, EVENTS } from '../../constants';

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



// export const rtrSuccessHandler = ({ stripes, setIsVisible, idleSessionTimer, data, emit, idleSeconds }) => {
//   stripes.logger.log('session', EVENTS.AUTHN.RTR_SUCCESS);
//   setIsVisible(false);
//   if (idleSessionTimer.current) {
//     clearTimeout(idleSessionTimer.current);
//   }

//   // reset the idle-session-timeout timer:
//   // if we received a new RT expiration with the event, use it.
//   // otherwise, retrieve the RT from storage and use that.
//   if (data?.rtExpires) {
//     const sessionTtl = data.rtExpires - Date.now();
//     idleSessionTimer.current = setTimeout(() => {
//       emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
//     }, (sessionTtl - (idleSeconds * 1000)));
//   } else {
//     getTokenExpiry().then((te) => {
//       const sessionTtl = te.rtExpires - Date.now();
//       idleSessionTimer.current = setTimeout(() => {
//         emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
//       }, (sessionTtl - (idleSeconds * 1000)));
//     });
//   }
// };




// import { CHANNELS, EVENTS } from '../../constants';
// import {
//   eventManager,
//   getTokenExpiry,
//   logout,
// } from '../../loginServices';

// const SessionEventContainer = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [expiry, setExpiry] = useState(0);
//   const stripes = useStripes();
//   const idleSessionTimer = useRef(null);

//   // how many seconds _before_ the session expires should we show a warning?
//   const idleSeconds = stripes.config.idleSessionWarningSeconds || 60;


//   /**
//    * configure window.event and BroadcastChannel listeners.
//    * This effect has NO dependencies and t
//    */
//   useEffect(() => {
//     const { emit, listen, bc } = eventManager({ channel: CHANNELS.AUTHN });

//     // session is idle; show modal
//     listen(EVENTS.AUTHN.IDLE_SESSION_WARNING, () => {
//       stripes.logger.log('session', EVENTS.AUTHN.IDLE_SESSION_WARNING);
//       getTokenExpiry().then((te) => {
//         setExpiry(te.rtExpires);
//         setIsVisible(true);
//       });
//     });

//     // RTR success; hide modal, reset session-idle timer
//     listen(EVENTS.AUTHN.RTR_SUCCESS, (e, data) => {
//       stripes.logger.log('session', EVENTS.AUTHN.RTR_SUCCESS);
//       setIsVisible(false);
//       if (idleSessionTimer.current) {
//         clearTimeout(idleSessionTimer.current);
//       }

//       // reset the idle-session-timeout timer:
//       // if we received a new RT expiration with the event, use it.
//       // otherwise, retrieve the RT from storage and use that.
//       if (data?.rtExpires) {
//         const sessionTtl = data.rtExpires - Date.now();
//         idleSessionTimer.current = setTimeout(() => {
//           emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
//         }, (sessionTtl - (idleSeconds * 1000)));
//       } else {
//         getTokenExpiry().then((te) => {
//           const sessionTtl = te.rtExpires - Date.now();
//           idleSessionTimer.current = setTimeout(() => {
//             emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
//           }, (sessionTtl - (idleSeconds * 1000)));
//         });
//       }
//     });

//     // initialize the idle-session timer us with cached RT expiration data
//     getTokenExpiry().then((te) => {
//       const sessionTtl = te.rtExpires - Date.now();
//       idleSessionTimer.current = setTimeout(() => {
//         emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
//       }, (sessionTtl - (idleSeconds * 1000)));
//     });

//     // session timeout, RTR failure, logout all behave the same way
//     listen([
//       EVENTS.AUTHN.IDLE_SESSION_TIMEOUT,
//       EVENTS.AUTHN.RTR_ERROR,
//       EVENTS.AUTHN.LOGOUT,
//     ], () => {
//       stripes.logger.log('session', 'RTR_ERROR or LOGOUT');

//       logout(stripes.okapi.url, stripes.store, true);
//     });

//     return () => {
//       clearTimeout(idleSessionTimer?.current);
//       bc.close();
//     };
//   }, [stripes, idleSeconds]);

//   // show the idle-session warning modal if necessary;
//   // otherwise return null
//   if (isVisible) {
//     return <KeepWorkingModal isVisible={isVisible} expiry={expiry} />;
//   }

//   return null;
// };

// export default SessionEventContainer;
