import satisfies from 'semver/functions/satisfies';

const isAbortError = (error) => error?.name === 'AbortError';

const validateManifestDependency = (remoteName, dependency) => {
  const pkgName = dependency?.name || dependency?.id || 'unknown-package';
  const { version, requiredVersion } = dependency || {};

  if (!version || !requiredVersion) {
    return null;
  }

  if (!satisfies(version, requiredVersion, { includePrerelease: true })) {
    return `[${remoteName}] '${pkgName}' version '${version}' does not satisfy host's required version: '${requiredVersion}'`;
  }

  return null;
};

export const validateRemoteDependencies = async (remotes = [], signal) => {
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
        failures.push(`[${remoteName}] failed to fetch manifest '${manifestUrl}' (${response.status})`);
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
  console.warn(`Remote dependency validation failed:\n${failures.map(f => `- ${f}`).join('\n')}`);
};

