import { useQuery } from 'react-query';
import { useRef, useState } from 'react';
import { useStripes } from '../StripesContext';
import useOkapiKy from '../useOkapiKy';

/**
 * useEntitlementChangeNotifier
 * Periodically query the entitlement endpoint `/entitlements/${tenant}/applications`
 * to determine whether entitlements have changed, returning true if they have,
 * false otherwise. That endpoint returns A LOT of data, but only the
 * application ids are compared. All other attributes are ignored.
 *
 * Set stripes.config.js::config.staleBundleWarning.interval to an integer value
 * representing the interval, in minutes, between queries. Defaults to 15.
 *
 * @returns boolean true if entitlement has changed; false otherwise.
 */
const useEntitlementChangeNotifier = () => {
  const INTERVAL_MINUTES = 15;

  const stripes = useStripes();
  const ky = useOkapiKy();
  const config = stripes?.config?.staleBundleWarning;
  const refetchInterval = (Number.isInteger(config?.interval) ? config.interval : INTERVAL_MINUTES) * 60 * 1000;
  const previous = useRef();
  const [isStale, setIsStale] = useState(false);

  useQuery({
    queryKey: ['EntitlementChangeWarning'],
    queryFn: async () => {
      const json = await ky(`entitlements/${stripes.okapi.tenant}/applications`, {
        searchParams: { limit: 500 }
      }).json();
      /* entitlement data looks, in part, like this:
       *
       *   { "applicationDescriptors": [
       *     { name: "foo", version: "1", id: "foo-1" }
       *     { name: "bar", version: "2", id: "bar-2" }
       *     { name: "bat", version: "1", id: "bat-1" }
       *   ]}
       *
       * so we can use id as a unique identifier. The remainder of the response
       * can be ignored. Sets allows for easy comparison regardless of order.
       * When the version of a module inside an application changes, there will
       * be a corresponding change in the application's version.
       */
      const idSet = new Set(json.applicationDescriptors.map(i => i.id));
      if (previous.current) {
        setIsStale(Boolean(previous.current.difference(idSet).size));
      }

      previous.current = idSet;
    },
    staleTime: refetchInterval,
    refetchInterval,
    enabled: !isStale,
  });

  return isStale;
};

export default useEntitlementChangeNotifier;
