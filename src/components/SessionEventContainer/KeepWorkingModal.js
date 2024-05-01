import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ms from 'ms';

import {
  Button,
  Modal
} from '@folio/stripes-components';

import { useStripes } from '../../StripesContext';

/**
 * KeepWorkingModal
 * Show a modal with a countdown timer representing the number of seconds
 * remaining until the session will expire due to inactivity.
 *
 * @param {function} callback function to call when clicking "Keep working" button
 */
const KeepWorkingModal = ({ callback }) => {
  const stripes = useStripes();
  const [remainingMillis, setRemainingMillis] = useState(ms(stripes.config.rtr.idleModalTTL));

  // configure an interval timer that sets state each second,
  // counting down to 0.
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMillis(i => i - 1000);
    }, 1000);

    // cleanup: clear the timer
    return () => {
      clearInterval(interval);
    };
  }, []);

  /**
   * timestampFormatter
   * convert time-remaining to mm:ss. Given the remaining time can easily be
   * represented as elapsed-time since the JSDate epoch, convert to a
   * Date object, format it, and extract the minutes and seconds.
   * That is, given we have 99 seconds left, that converts to a Date
   * like `1970-01-01T00:01:39.000Z`; extract the `01:39`.
   */
  const timestampFormatter = () => {
    if (remainingMillis > 1000) {
      return new Date(remainingMillis).toISOString().substring(14, 19);
    }

    return '0:00';
  };

  return (
    <Modal
      label={<FormattedMessage id="stripes-core.rtr.idleSession.modalHeader" />}
      open
      onClose={callback}
      footer={
        <Button onClick={callback} buttonStyle="primary" marginBottom0><FormattedMessage id="stripes-core.rtr.idleSession.keepWorking" /></Button>
      }
    >
      <div>
        <FormattedMessage id="stripes-core.rtr.idleSession.timeRemaining" />: {timestampFormatter()}
      </div>
    </Modal>
  );
};

KeepWorkingModal.propTypes = {
  callback: PropTypes.func,
};

export default KeepWorkingModal;
