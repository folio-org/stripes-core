export const loadEntitlement = async (entitlementUrl) => {
  const res = await fetch(entitlementUrl);
  const registry = await res.json();

  // process the registry data and return the remotes array
  // remap registry from an object shaped like { key1: app1, key2: app2, ...}
  // to an array shaped like [ { name: key1, ...app1 }, { name: key2, ...app2 } ...]
  // const remotes = Object.entries(registry?.discovery).map(([name, metadata]) => ({ name, ...metadata }));
  // split location into host, port for asset loading.
  registry.discovery.forEach(remote => {
    if (!remote?.location?.startsWith('http')) {
      remote.location = `${window.location.protocol}//${remote.location}`;
    }
    const url = new URL(remote.location);
    remote.host = url.hostname;
    remote.port = url.port;
    remote.origin = url.origin;
  });
  return Promise.resolve(registry.discovery);
};
