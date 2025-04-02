import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { MessageBanner } from '@folio/stripes-components';
import css from './style.css';

/**
 * FixedLengthSessionWarning
 * Show a callout with a countdown timer representing the number of seconds
 * remaining until the session expires.
 *
 * @param {function} callback function to call when clicking "Keep working" button
 */
const FixedLengthSessionWarning = ({ flsTimer }) => {
  /**
   * timestampFormatter
   * convert time-remaining to mm:ss. Given the remaining time can easily be
   * represented as elapsed-time since the JSDate epoch, convert to a
   * Date object, format it, and extract the minutes and seconds.
   * That is, given we have 99 seconds left, that converts to a Date
   * like `1970-01-01T00:01:39.000Z`; extract the `01:39`.
   */
  const timestampFormatter = () => {
    if (flsTimer >= 1000) {
      return new Date(flsTimer).toISOString().substring(14, 19);
    }

    return '00:00';
  };

  return <MessageBanner show contentClassName={css.fixedSessionBanner}><FormattedMessage id="stripes-core.rtr.fixedLengthSession.timeRemaining" /> {timestampFormatter()}</MessageBanner>;
};

FixedLengthSessionWarning.propTypes = {
  flsTimer: PropTypes.number.isRequired,
};

export default FixedLengthSessionWarning;
