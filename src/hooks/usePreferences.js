import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import useOkapiKy from '../useOkapiKy';
import { useStripes } from '../StripesContext';

export default () => {
  const { user } = useStripes();
  const ky = useOkapiKy();
  const [id, setId] = useState(null);
  const userId = user.user.id;

  const getPreference = useCallback(async ({ scope, key, callback }) => {
    // const res = await localforage.getItem(key, callback);
    // get preferences by querying preferences with the userId, scope, and key...
    // this will return an array that's likely a single item long. We store the item's id in state so that we can update it later.
    let respJSON = null;
    let resp;
    try {
      resp = await ky.get(`settings/entries?query=userId=="${userId}" and scope=="${scope}" and key=="${key}"`);
      if (resp.ok) {
        respJSON = await resp.json();
        if (respJSON.items.length === 1) {
          setId(respJSON.items[0].id);
        }
        return respJSON.items[0].value;
      }
    } catch (err) {
      console.log(`error getting preference at scope: ${scope}, and key: ${key} for user: ${userId} - ${err.message}`);
    }
  }, [id, ky, userId]);

  const setPreference = useCallback(async ({ scope, key, value, callback }) => {
    const prefId = id || uuidv4();
    const payload = {
      id: prefId,
      scope,
      key,
      value,
      userId
    };

    // if we didn't store an id upon retrieving user preferences, then one probably doesn't exist,
    // so we use the `POST` endpoint for saving... 'PUT', and including the id in the path is used for updating
    if (!id) {
      try {
        setId(prefId);
        return ky.post('settings/entries', { json: payload });
      } catch (err) {
        console.log(`error creating preference at scope: ${scope}, and key: ${key} for user: ${userId} - ${err.message}`);
      }
    } else {
      try {
        return ky.put(`settings/entries/${prefId}`, { json: payload });
      } catch (err) {
        console.log(`error updating preference at scope: ${scope}, and key: ${key} for user: ${userId} - ${err.message}`);
      }
    }
  }, [id, ky, userId]);

  const removePreference = useCallback(async ({ scope, key, callback }) => {
    try {
      if (id) {
        await ky.delete(`settings/entries/${id}`);
        setId(null);
        return;
      }
    } catch (err) {
      console.log(`error deleting preference at scope: ${scope}, and key: ${key} for user: ${userId} at id: ${id} - ${err.message}`);
    }
  }, [id, ky, userId]);

  return {
    setPreference,
    getPreference,
    removePreference,
  };
};
