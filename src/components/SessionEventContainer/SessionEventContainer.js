import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import createInactivityTimer from 'inactivity-timer';
import ms from 'ms';

import KeepWorkingModal from './KeepWorkingModal';
import { useStripes } from '../../StripesContext';
import { RTR_ACTIVITY_CHANNEL, RTR_TIMEOUT_EVENT } from '../Root/constants';
import { toggleRtrModal } from '../../okapiActions';

/**
 * SessionEventContainer
 * This component configures event-listeners for authentication-related events
 * like idle-session warnings and rtr-success alerts and either shows or hides
 * the KeepWorkingModal accordingly.
 *
 * @returns KeepWorkingModal or null
 */
const SessionEventContainer = ({ idleTimers }) => {
  // is the "keep working?" modal visible?
  const [isVisible, setIsVisible] = useState(false);

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
   * listen for activity on the BroadcastChannel
   * This event listener must be defined here, rather than with the others
   * in loginServicess::addRtrEventListeners, in order to be able to hide
   * the modal in window separate from the one where the activity occurred.
   */
  useEffect(() => {
    const bc = new BroadcastChannel(RTR_ACTIVITY_CHANNEL);
    const listener = () => {
      setIsVisible(false);
    };

    bc.addEventListener('message', listener);

    return () => {
      bc.close();
    };
  }, [idleTimers, stripes]);

  /**
   * configure the idle-activity timers and attach them to a ref
x   */
  useEffect(() => {
    if (stripes.okapi.isAuthenticated && idleTimers.current === null) {
      const { idleModalTTL, idleSessionTTL } = stripes.config.rtr;

      // show the modal
      const showModalIT = createInactivityTimer(ms(idleSessionTTL) - ms(idleModalTTL), () => {
        stripes.logger.log('rtr', 'session idle; showing modal');
        stripes.store.dispatch(toggleRtrModal(true));
        setIsVisible(true);
      });
      showModalIT.signal();

      // logout
      const logoutIT = createInactivityTimer(idleSessionTTL, () => {
        stripes.logger.log('rtr', 'session idle; dispatching RTR_TIMEOUT_EVENT');
        window.dispatchEvent(new Event(RTR_TIMEOUT_EVENT));
      });
      logoutIT.signal();

      idleTimers.current = { showModalIT, logoutIT };
    }
  }, [idleTimers, stripes]);

  // show the idle-session warning modal if necessary;
  // otherwise return null
  if (isVisible) {
    return <KeepWorkingModal isVisible={isVisible} callback={keepWorkingCallback} />;
  }

  return null;
};

SessionEventContainer.propTypes = {
  idleTimers: PropTypes.object,
};

export default SessionEventContainer;
