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
 * @returns {Promise} number of records to retrieve in an unpaged-query
 */
export const useQueryLimit = async () => {
  const { stripes } = useStripes();
  const { getTenantPreference } = useTenantPreferences();

  let limit = await getTenantPreference({ scope: settings.SCOPE, key: SETTINGS_KEY });
  if (!limit) {
    if (stripes.config.maxUnpagedResourceCount) {
      limit = stripes.config.maxUnpagedResourceCount;
    } else {
      limit = MAX_UNPAGED_RESOURCE_COUNT;
    }
  }

  return limit;
};
