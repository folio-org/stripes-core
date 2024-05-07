import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import createInactivityTimer from 'inactivity-timer';
import ms from 'ms';

import { logout, SESSION_NAME } from '../../loginServices';
import KeepWorkingModal from './KeepWorkingModal';
import { useStripes } from '../../StripesContext';
import {
  RTR_ACTIVITY_CHANNEL,
  RTR_ACTIVITY_EVENTS,
  RTR_ERROR_EVENT,
  RTR_TIMEOUT_EVENT
} from '../Root/constants';
import { toggleRtrModal } from '../../okapiActions';

//
// event listeners
// exported only to expose them for tests
//

// RTR error in this window: logout
export const thisWindowRtrError = (_e, stripes, history) => {
  console.warn('rtr error; logging out'); // eslint-disable-line no-console
  logout(stripes.okapi.url, stripes.store, history);
};

// idle session timeout in this window: logout
export const thisWindowRtrTimeout = (_e, stripes, history) => {
  stripes.logger.log('rtr', 'idle session timeout; logging out');
  logout(stripes.okapi.url, stripes.store, history, true);
};

// localstorage change in another window: logout?
// logout if it was a timeout event or if SESSION_NAME is being
// removed from localStorage, an indicator that logout is in-progress
// in another window and so must occur here as well
export const otherWindowStorage = (e, stripes, history) => {
  if (e.key === RTR_TIMEOUT_EVENT) {
    stripes.logger.log('rtr', 'idle session timeout; logging out');
    logout(stripes.okapi.url, stripes.store, history, true);
  } else if (!localStorage.getItem(SESSION_NAME)) {
    stripes.logger.log('rtr', 'external localstorage change; logging out');
    logout(stripes.okapi.url, stripes.store, history);
  }
};

// activity in another window: send keep-alive to idle-timers.
//
// when multiple tabs/windows are open, there is probably only activity
// in one but they will each have an idle-session timer running. thus,
// activity in each window is published on a BroadcastChannel to announce
// it to all windows in order to send a keep-alive ping to their timers.
export const otherWindowActivity = (_m, stripes, timers, setIsVisible) => {
  stripes.logger.log('rtrv', 'external activity signal');
  if (timers.current) {
    Object.values(timers.current).forEach((it) => {
      it.signal();
    });
  }

  // leverage state.okapi.rtrModalIsVisible, rather than isVisible.
  // due to early binding, the value of isVisible is locked-in when
  // this function is created.
  if (stripes.store.getState().okapi.rtrModalIsVisible) {
    setIsVisible(false);
    stripes.store.dispatch(toggleRtrModal(false));
  }
};

// activity in this window: ping idle-timers and BroadcastChannel
// if the "Keep working?" modal is visible, however, ignore all activity;
// then that is showing, only clicking its "confirm" button should
// constitute activity.
export const thisWindowActivity = (_e, stripes, timers, broadcastChannel) => {
  const state = stripes.store.getState();
  // leverage state.okapi.rtrModalIsVisible, rather than isVisible.
  // due to early binding, the value of isVisible is locked-in when
  // this function is created.
  if (!state.okapi.rtrModalIsVisible) {
    stripes.logger.log('rtrv', 'local activity signal');
    if (timers.current) {
      broadcastChannel.postMessage('signal');
      Object.values(timers.current).forEach((it) => {
        it.signal();
      });
    }
  }
};


/**
 * SessionEventContainer
 * This component component performs several jobs:
 * 1. it configures inactivity timers that fire after some period of
 *    inactivity, whether in this window or any other.
 * 2. it renders a "Keep working?" modal if the inactivity-timer fires.
 * 3. it configures activity listeners that (a) listen for activity in this
 *    window and reflect it to a BroadcastChannel to keep sessions alive in
 *    other windows, and (b) listen for activity on a BroadcastChannel to
 *    keep this window's session alive.
 *
 * By default, a session will be terminated after 60 minutes without activity.
 * By default, the "keep working?" modal will be visible for 1 minute, i.e.
 * after 59 minutes of inactivity. These values may be overridden in
 * stripes.config.js in the `config.rtr` object by the values `idleSessionTTL`
 * and `idleModalTTL`, respectively; the values must be strings parsable by ms.
 *
 * @param {object} history
 * @returns KeepWorkingModal or null
 */
const SessionEventContainer = ({ history }) => {
  // is the "keep working?" modal visible?
  const [isVisible, setIsVisible] = useState(false);

  // inactivity timers
  const timers = useRef();
  const stripes = useStripes();

  /**
   * keepWorkingCallback
   * handler for the "keep working" button in KeepWorkingModal
   * 1. hide the modal
   * 2. dispatch toggleRtrModal(false), reanimating listeners
   * 3. dispatch an event, which listeners will observe, triggering timers.
   *    listeners are put on hold while the modal is visible, so it's
   *    important to dispatch toggleRtrModal() before emitting the event.
   */
  const keepWorkingCallback = () => {
    setIsVisible(false);
    stripes.store.dispatch(toggleRtrModal(false));
    window.dispatchEvent(new Event(stripes.config.rtr.activityEvents[0]));
  };

  /**
   * 1. configure the idle-activity timers and attach them to a ref.
   * 2. configure event listeners for RTR activity.
   */
  useEffect(() => {
    // track activity in other windows
    // the only events emitted to this channel are pings, empty keep-alive
    // messages that indicate an event was processed, i.e. some activity
    // occurred, in another window, so this one should be kept alive too.
    // this means we just have to listen for "message received", we don't
    // actually have to parse the message.
    //
    // Logout events also leverage localStorage which, like BroadcastChannel,
    // emits events across tabs and windows. That would require actually
    // parsing the messages, contrary to the comment above, but would have
    // the benefit of consolidating listeners a little bit.
    const bc = new BroadcastChannel(RTR_ACTIVITY_CHANNEL);

    // mapping of channelName => eventName => handler
    // channels:
    //   window:
    //     event-a: foo()
    //     event-b: bar()
    //   bc:
    //     event-c: bat()
    const channels = { window: {}, bc: {} };

    // mapping of channelName => channel
    // i.e. same keys as channels, but the value is the identically named object
    const channelListeners = { window, bc };

    if (stripes.config.useSecureTokens) {
      const { idleModalTTL, idleSessionTTL } = stripes.config.rtr;

      // inactive timer: show the "keep working?" modal
      const showModalIT = createInactivityTimer(ms(idleSessionTTL) - ms(idleModalTTL), () => {
        stripes.logger.log('rtr', 'session idle; showing modal');
        stripes.store.dispatch(toggleRtrModal(true));
        setIsVisible(true);
      });
      showModalIT.signal();

      // inactive timer: logout
      const logoutIT = createInactivityTimer(idleSessionTTL, () => {
        stripes.logger.log('rtr', 'session idle; dispatching RTR_TIMEOUT_EVENT');
        // set a localstorage key so other windows know it was a timeout
        localStorage.setItem(RTR_TIMEOUT_EVENT, 'true');

        // dispatch a timeout event for handling in this window
        window.dispatchEvent(new Event(RTR_TIMEOUT_EVENT));
      });
      logoutIT.signal();

      timers.current = { showModalIT, logoutIT };

      // RTR error in this window: logout
      channels.window[RTR_ERROR_EVENT] = (e) => thisWindowRtrError(e, stripes, history);

      // idle session timeout in this window: logout
      channels.window[RTR_TIMEOUT_EVENT] = (e) => thisWindowRtrTimeout(e, stripes, history);

      // localstorage change in another window: logout?
      channels.window.storage = (e) => otherWindowStorage(e, stripes, history);

      // activity in another window: send keep-alive to idle-timers.
      channels.bc.message = (message) => otherWindowActivity(message, stripes, timers, setIsVisible);

      // activity in this window: ping idle-timers and BroadcastChannel
      const activityEvents = stripes.config.rtr?.activityEvents ?? RTR_ACTIVITY_EVENTS;
      activityEvents.forEach(eventName => {
        channels.window[eventName] = (e) => thisWindowActivity(e, stripes, timers, bc);
      });

      // add listeners
      Object.entries(channels).forEach(([k, channel]) => {
        Object.entries(channel).forEach(([e, h]) => {
          stripes.logger.log('rtrv', `adding listener ${k}.${e}`);
          channelListeners[k].addEventListener(e, h);
        });
      });
    }

    // cleanup: clear timers and event listeners
    return () => {
      if (timers.current) {
        Object.values(timers.current).forEach((it) => {
          it.clear();
        });
      }
      Object.entries(channels).forEach(([k, channel]) => {
        Object.entries(channel).forEach(([e, h]) => {
          stripes.logger.log('rtrv', `removing listener ${k}.${e}`);
          channelListeners[k].removeEventListener(e, h);
        });
      });

      bc.close();
    };

    // no deps? It should be history and stripes!!! >:)
    // We only want to configure the event listeners once, not every time
    // there is a change to stripes or history. Hence, an empty dependency
    // array.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // show the idle-session warning modal if necessary;
  // otherwise return null
  if (isVisible) {
    return <KeepWorkingModal callback={keepWorkingCallback} />;
  }

  return null;
};

SessionEventContainer.propTypes = {
  history: PropTypes.object,
};

export default SessionEventContainer;
