import localforage from 'localforage';
import { stripesHubAPI } from '../constants';

export const loadEntitlement = async (entitlementUrl, signal) => {
  let registry = {};
  const discovery = await localforage.getItem(stripesHubAPI.REMOTE_LIST_KEY);
  if (discovery) {
    registry = { discovery };
  } else if (entitlementUrl) {
    try {
      const res = await fetch(entitlementUrl, { signal });
      if (!res.ok) throw new Error('Unable to fetch entitlement Url');
      const registryData = await res.json();

      // strip out the host app if it's present...
      registry.discovery = registryData?.discovery.filter((entry) => entry.name !== stripesHubAPI.HOST_APP_NAME);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Entitlement fetch error:', e);
      }
    }
  }

  // Take the location information for each remote in the response and split out its origin...
  // i.e. 'http://localhost:3002/remoteEntry.js -> 'http://localhost:3002'
  // this origin is where stripes-core will attempt to fetch translations and assets from.

  registry?.discovery?.forEach(remote => {
    if (!remote?.location?.startsWith('http')) {
      remote.location = `${window.location.protocol}//${remote.location}`;
    }
    const url = new URL(remote.location);
    remote.host = url.hostname;
    remote.port = url.port;
    remote.origin = url.origin;
  });
  return Promise.resolve(registry?.discovery);
};
