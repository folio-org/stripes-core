import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import useOkapiKy from '../useOkapiKy';
import { useStripes } from '../StripesContext';

export default () => {
  const { logger } = useStripes();
  const ky = useOkapiKy();
  const [id, setId] = useState(null);

  const getTenantPreference = useCallback(async ({ scope, key }) => {
    // get preferences by querying preferences with the userId, scope, and key...
    // this will return an array that's likely a single item long. We store the item's id in state so that we can update it later.
    let respJSON = null;
    let resp;
    try {
      resp = await ky.get(`settings/entries?query=scope=="${scope}" and key=="${key}"`);
      if (resp.ok) {
        respJSON = await resp.json();
        if (respJSON.items.length > 0) {
          logger.log('pref', `found preference at scope: ${scope}, and key: ${key}`);
          setId(respJSON.items[0].id);
          return respJSON.items[0].value;
        } else {
          setId(null);
          logger.log('pref', `no preference found at scope: ${scope}, and key: ${key}`);
          return undefined;
        }
      }
    } catch (err) {
      logger.log('pref', `error getting preference at scope: ${scope}, and key: ${key} - ${err.message}`);
    }
    return undefined;
  }, [id, ky]); // eslint-disable-line

  const setTenantPreference = useCallback(async ({ scope, key, value }) => {
    const prefId = id || uuidv4();
    const payload = {
      id: prefId,
      scope,
      key,
      value,
    };

    // if we didn't store an id upon retrieving user preferences, then one probably doesn't exist,
    // so we use the `POST` endpoint for saving... 'PUT', and including the id in the path is used for updating
    if (!id) {
      try {
        await ky.post('settings/entries', { json: payload });
        setId(prefId);
        logger.log('pref', `created preference at scope: ${scope}, and key: ${key} with id: ${id} and value: ${value}`);
      } catch (err) {
        logger.log('pref', `error creating preference at scope: ${scope}, and key: ${key} - ${err.message}`);
      }
    } else {
      try {
        await ky.put(`settings/entries/${prefId}`, { json: payload });
        logger.log('pref', `updated preference at scope: ${scope}, and key: ${key} with ${value}`);
      } catch (err) {
        logger.log('pref', `error updating preference at scope: ${scope}, and key: ${key} - ${err.message}`);
      }
    }
  }, [id, ky, logger]);

  const removeTenantPreference = useCallback(async ({ scope, key }) => {
    try {
      if (id) {
        await ky.delete(`settings/entries/${id}`);
        setId(null);
        logger.log('pref', `deleted preference at scope: ${scope}, and key: ${key} at id: ${id}`);
        return;
      }
    } catch (err) {
      logger.log('pref', `error deleting preference at scope: ${scope}, and key: ${key} at id: ${id} - ${err.message}`);
    }
  }, [id, ky, logger]);

  return {
    setTenantPreference,
    getTenantPreference,
    removeTenantPreference,
  };
};
