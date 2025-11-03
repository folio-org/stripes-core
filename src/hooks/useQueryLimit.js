import { useEffect, useState } from 'react';

import { useStripes } from '../StripesContext';
import useTenantPreferences from './useTenantPreferences';
import { settings } from '../constants';

/** settings key for this tenant-level preference */
export const SETTINGS_KEY = 'query-limit';

/** default value, absent values from tenant-settings or stripes.confing.js */
export const MAX_UNPAGED_RESOURCE_COUNT = 2000;

/**
 * useQueryLimit
 * Provide the value to use in the `limit=` clause of an unpaged-records query,
 *
 * usage: const limit = useQueryLimit();
 *
 * i.e. when retrieving entries from a lookup table, how many entries should be
 * retrieved? Look first in tenant-settings, then in stripes.config.js, then
 * return a default, hard-coded value.
 *
 * @returns {Number} number of records to retrieve in an unpaged-query
 */
export const useQueryLimit = () => {
  const [limit, setLimit] = useState(null);
  const { stripes } = useStripes();
  const { getTenantPreference } = useTenantPreferences();

  useEffect(() => {
    const getLimit = async () => {
      let value = await getTenantPreference({ scope: settings.SCOPE, key: SETTINGS_KEY });
      if (!value) {
        if (stripes.config.maxUnpagedResourceCount) {
          value = stripes.config.maxUnpagedResourceCount;
        } else {
          value = MAX_UNPAGED_RESOURCE_COUNT;
        }
      }

      setLimit(value);
    };

    getLimit();
  }, [getTenantPreference, stripes.config.maxUnpagedResourceCount]);

  return limit;
};
