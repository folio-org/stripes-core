import { useQuery } from 'react-query';
import ky from 'ky';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, MessageBanner } from '@folio/stripes-components';
import { useStripes } from '../StripesContext';

const StaleBundleWarning = () => {
  const stripes = useStripes();
  const config = stripes?.config?.staleBundleWarning;
  const refetchInterval = (config?.interval ?? 15) * 60 * 1000;
  const [previous, setPrevious] = useState();
  const [stale, setStale] = useState(false);
  const query = useQuery({
    queryKey: ['StaleBundleWarning'],
    queryFn: async () => {
      if (typeof config?.path !== 'string') return null;
      try {
        if (typeof config?.header === 'string') {
          const res = await ky(config.path, { method: 'head' });
          return res.headers.get(config.header);
        } else {
          return await ky.get(config.path).text();
        }
      } catch (e) {
        console.warn(`'Error checking for new bundle ${e}`); // eslint-disable-line no-console
        return null;
      }
    },
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
      <Button buttonStyle="link" onClick={() => window.location.reload(true)} marginBottom0>
        <FormattedMessage id="stripes-core.stale.reload" />
      </Button>
    </MessageBanner>
  );
};

export default StaleBundleWarning;
