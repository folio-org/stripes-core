/* eslint-disable import/prefer-default-export */

export function checkIfUserInCentralTenant(stripes) {
  if (!stripes.hasInterface('consortia')) {
    return false;
  }

  return stripes.okapi.tenant === stripes.user.user?.consortium?.centralTenantId;
}

export function checkIfUserInMemberTenant(stripes) {
  if (!stripes.hasInterface('consortia')) {
    return false;
  }

  return stripes.okapi.tenant !== stripes.user.user?.consortium?.centralTenantId;
}
