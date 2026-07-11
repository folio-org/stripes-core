import { FormattedMessage } from 'react-intl';
import { Button, MessageBanner } from '@folio/stripes-components';

import useEntitlementDidChange from '../hooks/useEntitlementDidChange';

/**
 * EntitlementChangeBanner
 * Display an interactive banner containing a "reload" button when a change
 * to entitlement is detected. useEntitlementDidChange() periodically polls
 * the entitlement endpoint and compares previous/current results.
 *
 * @see StaleBundleWarning, which was the base for this component and hook but
 *   which relies on a static path for its query and which compares the entire
 *   response-body, rather than just the application-ids.
 */
const EntitlementChangeBanner = () => {
  const stale = useEntitlementDidChange();

  return (
    <MessageBanner type="warning" show={stale}>
      <FormattedMessage id="stripes-core.stale.warning" />
      {' '}
      <Button buttonStyle="link" onClick={() => window.location.reload(true)} marginBottom0>
        <FormattedMessage id="stripes-core.stale.reload" />
      </Button>
    </MessageBanner>
  );
};

export default EntitlementChangeBanner;
