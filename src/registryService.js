/**
 * registryService
 *
 * A decoupled, platform-level bridge that lets independently-developed
 * `ui-*` modules share small bits of information with one another without
 * taking a hard dependency on each other. A module that owns some concept
 * (e.g. `ui-users` owning "user") calls `register()` to publish fields
 * against a shared `type` key; any other module can look those fields up
 * with `requestRegistryElement()`/`requestRegistryLink()`, and must decide
 * its own fallback when nothing has been registered.
 *
 * Different modules may register different fields under the same `type`
 * independently, e.g. `ui-users` registers a `link` for type `user`, while
 * `ui-plugin-find-user` separately registers a `findPlugin` trigger for the
 * same type. `register()` merges fields into the existing bucket for a
 * type rather than replacing it wholesale.
 */

const registry = new Map();

/**
 * register
 * Publish one or more registry entries. Each entry must have a `type`
 * field; all other fields are merged into the existing bucket for that
 * type. Re-registering a field with a different value overwrites the
 * previous value and logs a warning.
 *
 * @param {object|object[]} entries a single entry or array of entries,
 *   each shaped like { type, ...fields }
 */
export function register(entries) {
  const list = Array.isArray(entries) ? entries : [entries];

  list.forEach(({ type, ...fields }) => {
    const bucket = registry.get(type) || {};

    Object.keys(fields).forEach((field) => {
      if (field in bucket && bucket[field] !== fields[field]) {
        // eslint-disable-next-line no-console
        console.warn(`registryService: overwriting existing "${field}" for type "${type}"`);
      }
      bucket[field] = fields[field];
    });

    registry.set(type, bucket);
  });
}

/**
 * requestRegistryElement
 * Look up a previously registered value. Returns undefined if nothing
 * has been registered for the given type (or field), leaving fallback
 * behavior entirely up to the caller.
 *
 * @param {string} type
 * @param {string} [field] when omitted, returns the entire bucket for type
 * @returns {*} the registered value, the entire bucket, or undefined
 */
export function requestRegistryElement(type, field) {
  const bucket = registry.get(type);
  if (!bucket) {
    return undefined;
  }

  return field === undefined ? bucket : bucket[field];
}

/**
 * requestRegistryLink
 * Sugar for the baseline convention: a templated URL for a type's record
 * detail page.
 *
 * @param {string} type
 * @returns {string|undefined}
 */
export function requestRegistryLink(type) {
  return requestRegistryElement(type, 'link');
}

/**
 * resetRegistry
 * Clear all registered entries. Not part of the public stripes-core
 * export; intended for test isolation only.
 */
export function resetRegistry() {
  registry.clear();
}
