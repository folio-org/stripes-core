import localforage from 'localforage';
import { stripesHubAPI } from '../constants';

export const loadEntitlement = async (discoveryUrl, signal) => {
  let registry = {};
  const discovery = await localforage.getItem(stripesHubAPI.REMOTE_LIST_KEY);
  if (discovery) {
    registry = { discovery };
  } else if (discoveryUrl) {
    try {
      const res = await fetch(discoveryUrl, { signal });
      if (!res.ok) throw new Error(`Unable to fetch discoveryUrl ${discoveryUrl}`);
      const registryData = await res.json();

      // strip out the host app if it's present (we ARE the host app; we don't
      // want to load ourselves. that would result in the host app loading the
      // host app, then loading entitlement and stripping out the host app if
      // it's present...)
      registry.discovery = registryData?.discovery.filter((entry) => entry.name !== stripesHubAPI.HOST_APP_NAME);

      await localforage.setItem(stripesHubAPI.REMOTE_LIST_KEY, registry.discovery);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Discovery fetch error:', e); // eslint-disable-line no-console
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
    const segments = url.href.split('/');
    segments.pop();
    const hrefWithoutFilename = segments.join('/')
    remote.assetPath = hrefWithoutFilename;
  });
  return Promise.resolve(registry?.discovery);
};
