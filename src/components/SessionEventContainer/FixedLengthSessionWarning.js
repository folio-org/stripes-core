import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ms from 'ms';

import {
  MessageBanner
} from '@folio/stripes-components';

import {
  RTR_TIME_MARGIN
} from '../Root/constants';
import { timestampFormatter } from './utils';
import { useStripes } from '../../StripesContext';

/**
 * FixedLengthSessionWarning
 * Show a callout with a countdown timer representing the number of seconds
 * remaining until the session expires.
 *
 * @param {function} callback function to call when clicking "Keep working" button
 */
const FixedLengthSessionWarning = () => {
  const stripes = useStripes();
  const [remainingMillis, setRemainingMillis] = useState(ms(stripes.config.rtr.fixedLengthSessionWarningTTL) - ms(RTR_TIME_MARGIN));

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

  return <MessageBanner type="warning" show><FormattedMessage id="stripes-core.rtr.fixedLengthSession.timeRemaining" /> {timestampFormatter(remainingMillis)}</MessageBanner>;
};

export default FixedLengthSessionWarning;
