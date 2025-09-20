/* eslint-disable import/prefer-default-export */

export function checkIfUserInCentralTenant(stripes) {
  const hasConsortia = stripes.hasInterface('consortia');
  if (!hasConsortia) {
    return false;
  }

  return stripes.okapi.tenant === stripes.user.user?.consortium?.centralTenantId;
}

export function checkIfUserInMemberTenant(stripes) {
  const hasConsortia = stripes.hasInterface('consortia');
  if (!hasConsortia) {
    return false;
  }

  return stripes.okapi.tenant !== stripes.user.user?.consortium?.centralTenantId;
}
