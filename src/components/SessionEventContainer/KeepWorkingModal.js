import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import {
  Button,
  Modal
} from '@folio/stripes-components';

import { rtr } from '../Root/token-util';
import { useStripes } from '../../StripesContext';
import useCountdown from './useCountdown';
import { eventManager } from '../../loginServices';
import { EVENTS } from '../../constants';

/**
 * KeepWorkingModal
 * Show a modal with a countdown timer representing the number of seconds
 * remaining until the session will expire due to inactivity. The "Keep working"
 * button will invoke RTR and close the modal.
 *
 * @param {boolean} isVisible true if the modal should be open
 * @param {number} expiry the number of milliseconds remaining before the session expires
 * @returns
 */
const KeepWorkingModal = ({ isVisible, expiry }) => {
  const remainingMillis = useCountdown(expiry);
  const stripes = useStripes();

  const handleClick = () => {
    rtr({
      nativeFetch: global.fetch,
      logger: stripes.logger,
    });
  };

  if (remainingMillis < 0) {
    const { emit } = eventManager({ channel: EVENTS.AUTHN });
    emit(EVENTS.AUTHN.IDLE_SESSION_TIMEOUT);
  }

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

    console.error('Could not format', remainingMillis);
    return <FormattedNumber value={0} />;
  };

  return (
    <Modal
      label="stripes-core.idle-session.modalHeader"
      open={isVisible}
      onClose={handleClick}
      footer={
        <Button onClick={handleClick} buttonStyle="primary" marginBottom0><FormattedMessage id="stripes-core.idle-session.keepWorking" /></Button>
      }
    >
      <div>
        <FormattedMessage id="stripes-core.idle-session.timeRemaining" />: {timestampFormatter(remainingMillis)}
      </div>
    </Modal>
  );
};

KeepWorkingModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  expiry: PropTypes.number,
};

export default KeepWorkingModal;
