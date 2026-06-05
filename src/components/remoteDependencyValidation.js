import satisfies from 'semver/functions/satisfies';

/**
 * Check whether the provided error is an AbortError.
 * @param {any} error - The error object to inspect.
 * @returns {boolean} True if the error is an AbortError, otherwise false.
 */
const isAbortError = (error) => error?.name === 'AbortError';

/**
 * Construct a message for failures fetching the remote's mf-manifest file.
 * @param {string} remoteName - The name of the remote module.
 * @param {string} manifestUrl - The URL of the mf-manifest that failed to fetch.
 * @param {number|string} status - HTTP status or error code returned by the fetch.
 * @returns {string} Human-readable error message.
 */
export const formatManifestFetchFailure = (remoteName, manifestUrl, status) => {
  return `[${remoteName}] failed to fetch manifest '${manifestUrl}' (${status})`;
};

/**
 * Construct a message for dependency version mismatches.
 * @param {string} remoteName - The name of the remote module.
 * @param {string} pkgName - The package name that has a version mismatch.
 * @param {string} version - The version used to build the remote.
 * @param {string} requiredVersion - The host's provided version range.
 * @returns {string} Human-readable mismatch message.
 */
export const formatDependencyMismatch = (remoteName, pkgName, version, requiredVersion) => {
  return `[${remoteName}] '${pkgName}' version '${version}' does not satisfy host's required version: '${requiredVersion}'`;
};

/**
 * Validate a single shared dependency entry from a remote manifest.
 * @param {string} remoteName - The name of the remote module the dependency belongs to.
 * @param {Object} dependency - Dependency descriptor from the manifest (may include `name`/`id`, `version`, and `requiredVersion`).
 * @returns {string|null} A formatted failure message if validation fails, otherwise null.
 */
const validateManifestDependency = (remoteName, dependency) => {
  const pkgName = dependency?.name || dependency?.id || 'unknown-package';
  const { version, requiredVersion } = dependency || {};

  if (!version || !requiredVersion) {
    return null;
  }

  if (!satisfies(version, requiredVersion, { includePrerelease: true })) {
    return formatDependencyMismatch(remoteName, pkgName, version, requiredVersion);
  }

  return null;
};

/**
 * Check remote modules for dependency compatibility against the host.
 * Fetches each remote's `mf-manifest.json` and checks shared dependency version ranges.
 * Any incompatibilities (required ranges from host that do not satisfy the remote's version)
 * are collected and logged as a warning.
 *
 * @param {AbortSignal} [signal] - AbortSignal to cancel network requests.
 * @param {Array<Object>} [remotes=[]] - Array of remote objects; each should include at least `name` and `assetPath`.
 * @returns {Promise<void>} Resolves when validation completes or is aborted.
 */
export const logRemoteDependencyViolations = async (signal, remotes = []) => {
  if (signal?.aborted || !Array.isArray(remotes) || !remotes.length) {
    return;
  }

  const failures = [];

  await Promise.all(remotes.map(async (remote) => {
    const remoteName = remote?.name || 'unknown-remote';

    try {
      const manifestUrl = `${remote.assetPath}/mf-manifest.json`;
      const response = await fetch(manifestUrl, { signal });

      if (!response.ok) {
        failures.push(formatManifestFetchFailure(remoteName, manifestUrl, response.status));
        return;
      }

      const manifest = await response.json();
      const sharedDependencies = Array.isArray(manifest?.shared) ? manifest.shared : [];

      sharedDependencies.forEach((dependency) => {
        const validationFailure = validateManifestDependency(remoteName, dependency);
        if (validationFailure) {
          failures.push(validationFailure);
        }
      });
    } catch (error) {
      if (isAbortError(error) || signal?.aborted) {
        return;
      }

      failures.push(`[${remoteName}] ${error?.message || error}`);
    }
  }));

  if (signal?.aborted || !failures.length) {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(`Remote dependency validation failed:\n${failures.map(f => '- ' + f).join('\n')}`);
};

