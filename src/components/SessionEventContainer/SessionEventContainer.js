import { useEffect, useRef, useState } from 'react';

import { CHANNELS, EVENTS } from '../../constants';
import {
  eventManager,
  getTokenExpiry,
  logout,
} from '../../loginServices';
import KeepWorkingModal from './KeepWorkingModal';
import { useStripes } from '../../StripesContext';

export const idleSessionWarningHandler = ({ stripes, setExpiry, setIsVisible }) => {
  stripes.logger.log('session', EVENTS.AUTHN.IDLE_SESSION_WARNING);
  return getTokenExpiry()
    .then((te) => {
      setExpiry(te.rtExpires);
      setIsVisible(true);
    });
};

export const rtrSuccessHandler = ({ stripes, setIsVisible, idleSessionTimer, data, emit, idleSeconds }) => {
  stripes.logger.log('session', EVENTS.AUTHN.RTR_SUCCESS);
  setIsVisible(false);
  if (idleSessionTimer.current) {
    clearTimeout(idleSessionTimer.current);
  }

  // reset the idle-session-timeout timer:
  // if we received a new RT expiration with the event, use it.
  // otherwise, retrieve the RT from storage and use that.
  if (data?.rtExpires) {
    const sessionTtl = data.rtExpires - Date.now();
    idleSessionTimer.current = setTimeout(() => {
      emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
    }, (sessionTtl - (idleSeconds * 1000)));
  } else {
    return getTokenExpiry().then((te) => {
      const sessionTtl = te.rtExpires - Date.now();
      idleSessionTimer.current = setTimeout(() => {
        emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
      }, (sessionTtl - (idleSeconds * 1000)));
    });
  }
};

/**
 * SessionEventContainer
 * This component configures event-listeners for authentication-related events
 * like idle-session warnings and rtr-success alerts and either shows or hides
 * the KeepWorkingModal accordingly.
 *
 * @returns KeepWorkingModal or null
 */
const SessionEventContainer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [expiry, setExpiry] = useState(0);
  const stripes = useStripes();
  const idleSessionTimer = useRef(null);

  // how many seconds _before_ the session expires should we show a warning?
  const idleSeconds = stripes.config.idleSessionWarningSeconds || 60;


  /**
   * configure window.event and BroadcastChannel listeners.
   * This effect has NO dependencies and t
   */
  useEffect(() => {
    const { emit, listen, bc } = eventManager({ channel: CHANNELS.AUTHN });

    // session is idle; show modal
    listen(EVENTS.AUTHN.IDLE_SESSION_WARNING, () => {
      idleSessionWarningHandler({ stripes, setExpiry, setIsVisible });
    });

    // RTR success; hide modal, reset session-idle timer
    listen(EVENTS.AUTHN.RTR_SUCCESS, (e, data) => {
      rtrSuccessHandler({ stripes, setIsVisible, idleSessionTimer, data, emit, idleSeconds });
    });


    // initialize the idle-session timer us with cached RT expiration data
    getTokenExpiry().then((te) => {
      const sessionTtl = te.rtExpires - Date.now();
      idleSessionTimer.current = setTimeout(() => {
        emit(EVENTS.AUTHN.IDLE_SESSION_WARNING);
      }, (sessionTtl - (idleSeconds * 1000)));
    });

    // session timeout, RTR failure, logout all behave the same way
    listen([
      EVENTS.AUTHN.IDLE_SESSION_TIMEOUT,
      EVENTS.AUTHN.RTR_ERROR,
      EVENTS.AUTHN.LOGOUT,
    ], () => {
      stripes.logger.log('session', 'RTR_ERROR or LOGOUT');

      logout(stripes.okapi.url, stripes.store, true);
    });

    return () => {
      clearTimeout(idleSessionTimer?.current);
      bc.close();
    };
  }, [stripes, idleSeconds]);

  // show the idle-session warning modal if necessary;
  // otherwise return null
  if (isVisible) {
    return <KeepWorkingModal isVisible={isVisible} expiry={expiry} />;
  }

  return null;
};

export default SessionEventContainer;
