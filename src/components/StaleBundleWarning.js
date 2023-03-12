/**
 * Displays a banner warning users that a reload may be required based on a
 * remote file or header having changed. This is configured in stripes.config.js
 * via the staleBundleWarning property under the config section:
 *
 * staleBundleWarning - When present, this optional object will enable a
 * periodic check to let users know when to reload the page because the bundle
 * has changed. It takes the following properties:
 *
 * * path - path to fetch, this is the only required parameter
 *
 * * header - instead of the default to fetch and compare the body of a file
 * (perhaps containing a build or commit id), use HTTP HEAD and the specified
 * header
 *
 * * interval - how many minutes to wait between checks, defaults to 15
 *
 * eg. to compare the last-modified header of index.html every 5 minutes:
 * { path: '/index.html', header: 'last-modified', interval: 5 }
 */

import { useQuery } from 'react-query';
import ky from 'ky';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, MessageBanner } from '@folio/stripes-components';
import { useStripes } from '../StripesContext';

export const queryFn = async (config, kyImpl) => {
  if (typeof config?.path !== 'string') return null;
  try {
    if (typeof config?.header === 'string') {
      const res = await kyImpl(config.path, { method: 'head' });
      return res.headers.get(config.header);
    } else {
      return await kyImpl.get(config.path).text();
    }
  } catch (e) {
    console.warn(`Error checking for new bundle ${e}`); // eslint-disable-line no-console
    return null;
  }
};

const StaleBundleWarning = () => {
  const stripes = useStripes();
  const config = stripes?.config?.staleBundleWarning;
  const refetchInterval = (config?.interval ?? 15) * 60 * 1000;
  const [previous, setPrevious] = useState();
  const [stale, setStale] = useState(false);

  const query = useQuery({
    queryKey: ['StaleBundleWarning'],
    queryFn: () => queryFn(config, ky),
    staleTime: refetchInterval,
    refetchInterval,
    enabled: !stale,
  });

  useEffect(() => {
    if (!previous) {
      setPrevious(query.data);
      return;
    }
    if (previous !== query.data) setStale(true);
  }, [previous, query.data, stale]);

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

export default StaleBundleWarning;
