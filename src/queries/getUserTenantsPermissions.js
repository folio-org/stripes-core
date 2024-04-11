/**
 * getUserTenantsPermissions
 * Retrieve the currently-authenticated user's permissions in each of the
 * given tenants
 * @param {object} stripes
 * @param {array} tenants array of tenantIds
 * @returns []
 */
const getUserTenantsPermissions = async (stripes, tenants = []) => {
  const {
    user: { user: { id } },
    okapi: {
      url,
      token,
    }
  } = stripes;
  const userTenantIds = tenants.map(tenant => tenant.id || tenant);

  const promises = userTenantIds.map(async (tenantId) => {
    const result = await fetch(`${url}/perms/users/${id}/permissions?full=true&indexField=userId`, {
      headers: {
        'X-Okapi-Tenant': tenantId,
        'Content-Type': 'application/json',
        ...(token && { 'X-Okapi-Token': token }),
      },
      credentials: 'include',
    });

    const json = await result.json();

    return { tenantId, ...json };
  });

  const userTenantsPermissions = await Promise.allSettled(promises);

  return userTenantsPermissions.map(userTenantsPermission => userTenantsPermission.value);
};

export default getUserTenantsPermissions;
