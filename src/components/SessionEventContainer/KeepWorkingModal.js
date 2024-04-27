import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ms from 'ms';

import {
  Button,
  Modal
} from '@folio/stripes-components';

import { RTR_TIMEOUT_EVENT } from '../Root/constants';
import { useStripes } from '../../StripesContext';
import useCountdown from './useCountdown';

/**
 * KeepWorkingModal
 * Show a modal with a countdown timer representing the number of seconds
 * remaining until the session will expire due to inactivity. When the timer
 * hits 0, dispatch window.RTR_TIMEOUT_EVENT.
 *
 * @param {boolean} isVisible true if the modal should be open
 * @param {function} callback function to call when clicking "Keep working" button
 */
const KeepWorkingModal = ({ isVisible, callback }) => {
  const stripes = useStripes();

  // useCountdown sets an interval timer, changing its return value each
  // second, causing a re-render
  const remainingMillis = useCountdown(ms(stripes.config.rtr.idleModalTTL));

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
      label="stripes-core.idle-session.modalHeader"
      open={isVisible}
      onClose={callback}
      footer={
        <Button onClick={callback} buttonStyle="primary" marginBottom0><FormattedMessage id="stripes-core.idle-session.keepWorking" /></Button>
      }
    >
      <div>
        <FormattedMessage id="stripes-core.idle-session.timeRemaining" />: {timestampFormatter()}
      </div>
    </Modal>
  );
};

KeepWorkingModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  callback: PropTypes.func,
};

export default KeepWorkingModal;
