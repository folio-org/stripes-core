/**
 * isGuardable
 * Return true if a route may show a navigation-guard when there is work in
 * progress (e.g. due to a dirty form or ongoing upload) to prompt whether the
 * user wants to abandon this work, or false if the navigation is obligatory
 * (e.g. due to a session being terminated) and user input is irrelevant.
 *
 * @param {string} route the destination route
 * @returns {boolean} true if a route may be guarded; false otherwise
 */
const isGuardable = route => {
  const obligatoryRoutes = ['/logout'];

  // if the given route matches an obligator route, it cannot be guarded
  return !(obligatoryRoutes.some(i => route.startsWith(i)));
};

export default isGuardable;
