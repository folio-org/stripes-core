import {
  useCallback,
  useRef,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import useOkapiKy from '../useOkapiKy';
import { useStripes } from '../StripesContext';

export default () => {
  const { user, logger } = useStripes();
  const ky = useOkapiKy();

  // use a ref to store the id of the setting so that it will be available for the next request when we chain.
  const idRef = useRef(null);
  const setId = useCallback(newId => { idRef.current = newId; }, []);

  const userId = user.user.id;

  const getPreference = useCallback(async ({ scope, key, userId: providedUserId }) => { // eslint-disable-line
    // get preferences by querying preferences with the userId, scope, and key...
    // this will return an array that's likely a single item long. We store the item's id in state so that we can update it later.
    let respJSON = null;
    let resp;

    const _userId = providedUserId || userId;

    try {
      resp = await ky.get(`settings/entries?query=userId=="${_userId}" and scope=="${scope}" and key=="${key}"`);
      if (resp.ok) {
        respJSON = await resp.json();
        if (respJSON.items.length > 0) {
          logger.log('pref', `found preference at scope: ${scope}, and key: ${key} for user: ${_userId}`);
          setId(respJSON.items[0].id);
          return respJSON.items[0].value;
        } else {
          setId(null);
          logger.log('pref', `no preference found at scope: ${scope}, and key: ${key} for user: ${_userId}`);
          return undefined;
        }
      }
    } catch (err) {
      logger.log('pref', `error getting preference at scope: ${scope}, and key: ${key} for user: ${_userId} - ${err.message}`);
    }
  }, [ky, userId, setId]); // eslint-disable-line

  const setPreference = useCallback(async ({ scope, key, value, userId: providedUserId }) => {
    const _userId = providedUserId || userId;
    const id = idRef.current;
    const prefId = id || uuidv4();
    const payload = {
      id: prefId,
      scope,
      key,
      value,
      userId: _userId,
    };

    // if we didn't store an id upon retrieving user preferences, then one probably doesn't exist,
    // so we use the `POST` endpoint for saving... 'PUT', and including the id in the path is used for updating
    if (!id) {
      try {
        await ky.post('settings/entries', { json: payload });
        setId(prefId);
        logger.log('pref', `created preference at scope: ${scope}, and key: ${key} for user: ${_userId} with id: ${id} and value: ${value}`);
      } catch (err) {
        logger.log('pref', `error creating preference at scope: ${scope}, and key: ${key} for user: ${_userId} - ${err.message}`);
      }
    } else {
      try {
        await ky.put(`settings/entries/${prefId}`, { json: payload });
        logger.log('pref', `updated preference at scope: ${scope}, and key: ${key} for user: ${_userId} with ${value}`);
      } catch (err) {
        logger.log('pref', `error updating preference at scope: ${scope}, and key: ${key} for user: ${_userId} - ${err.message}`);
      }
    }
  }, [idRef, ky, userId, setId]); // eslint-disable-line

  const removePreference = useCallback(async ({ scope, key, userId: providedUserId }) => {
    const _userId = providedUserId || userId;
    const id = idRef.current;

    try {
      if (id) {
        await ky.delete(`settings/entries/${id}`);
        setId(null);
        logger.log('pref', `deleted preference at scope: ${scope}, and key: ${key} for user: ${_userId} at id: ${id}`);
        return;
      }
    } catch (err) {
      logger.log('pref', `error deleting preference at scope: ${scope}, and key: ${key} for user: ${_userId} at id: ${id} - ${err.message}`);
    }
  }, [idRef, ky, userId, setId]); // eslint-disable-line

  return {
    setPreference,
    getPreference,
    removePreference,
  };
};
