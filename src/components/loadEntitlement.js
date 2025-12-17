export const loadEntitlement = async (entitlementUrl) => {
  const res = await fetch(entitlementUrl);
  const registry = await res.json();

  // process the registry data and return the remotes array
  // remap registry from an object shaped like { key1: app1, key2: app2, ...}
  // to an array shaped like [ { name: key1, ...app1 }, { name: key2, ...app2 } ...]
  const remotes = Object.entries(registry?.remotes).map(([name, metadata]) => ({ name, ...metadata }));
  return Promise.resolve(remotes);
};
