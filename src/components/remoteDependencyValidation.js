import { intersects, satisfies, validRange } from 'semver';

const { peerDependencies: stripesCorePeerDependencies = {} } = require('../../package');

const getRemoteAssetPath = (remote) => {
  if (remote.assetPath) {
    return remote.assetPath;
  }

  const url = new URL(remote.location);
  const segments = url.href.split('/');
  segments.pop();
  return segments.join('/');
};

const getRemoteStatsUrl = (remote) => `${getRemoteAssetPath(remote)}/mf-stats.json`;

export const getPeerDependencyDisagreements = (hostPeerDependencies, remoteStats) => {
  const sharedDependencies = Array.isArray(remoteStats?.shared) ? remoteStats.shared : [];

  return Object.entries(hostPeerDependencies).flatMap(([dependencyName, hostRequiredVersion]) => {
    const remoteDependency = sharedDependencies.find(sharedDependency => sharedDependency.name === dependencyName);

    if (!remoteDependency) {
      return [];
    }

    const hostRange = validRange(hostRequiredVersion);
    const remoteRange = remoteDependency.requiredVersion ? validRange(remoteDependency.requiredVersion) : null;
    const resolvedVersion = remoteDependency.version;
    let reason;

    if (!hostRange) {
      return [];
    }

    if (remoteDependency.requiredVersion && !remoteRange) {
      reason = `${dependencyName}: remote requiredVersion '${remoteDependency.requiredVersion}' is not a valid semver range`;
    } else if (resolvedVersion && !satisfies(resolvedVersion, hostRange, { includePrerelease: true })) {
      reason = `${dependencyName}: stripes-core requires ${hostRequiredVersion}, remote resolves ${resolvedVersion}`;
    }

    return reason ? [{
      name: dependencyName,
      hostRequiredVersion,
      remoteRequiredVersion: remoteDependency.requiredVersion,
      remoteVersion: resolvedVersion,
      reason,
    }] : [];
  });
};

export const validateRemotePeerDependencies = async (
  remotes,
  signal,
  hostPeerDependencies = stripesCorePeerDependencies,
) => {
  const disagreements = [];
  const validationFailures = [];

  const statsResults = await Promise.allSettled(remotes.map(async (remote) => {
    const statsUrl = getRemoteStatsUrl(remote);
    const response = await fetch(statsUrl, { signal });

    if (!response.ok) {
      return {
        remote,
        disagreements: [],
      };
    }

    const remoteStats = await response.json();
    return {
      remote,
      disagreements: getPeerDependencyDisagreements(hostPeerDependencies, remoteStats),
    };
  }));

  statsResults.forEach((result, index) => {
    const remote = remotes[index];

    if (result.status === 'fulfilled') {
      if (result.value.disagreements.length) {
        disagreements.push(result.value);
      }
    } else if (result.reason?.name !== 'AbortError') {
      validationFailures.push({ remote, reason: result.reason });
    }
  });

  if (disagreements.length && !signal?.aborted) {
    const incompatibilityMessages = disagreements.map(({ remote, disagreements: remoteDisagreements }) => (
      `- ${remote.name}: ${remoteDisagreements.map(disagreement => disagreement.reason).join('; ')}`
    ));
    const errorMsg = [
      'Remote module dependency incompatibilities detected:',
      ...incompatibilityMessages,
    ].join('\n');
    console.error(errorMsg); // eslint-disable-line no-console
  }

  return { disagreements, validationFailures };
};
