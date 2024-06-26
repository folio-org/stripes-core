/** dispatched during RTR when it is successful */
export const RTR_SUCCESS_EVENT = '@folio/stripes/core::RTRSuccess';

/** dispatched during RTR if RTR itself fails */
export const RTR_ERROR_EVENT = '@folio/stripes/core::RTRError';

/**
 * dispatched if the session is idle (without activity) for too long
 */
export const RTR_TIMEOUT_EVENT = '@folio/stripes/core::RTRIdleSessionTimeout';

/** BroadcastChannel for cross-window activity pings */
export const RTR_ACTIVITY_CHANNEL = '@folio/stripes/core::RTRActivityChannel';

/** how much of an AT's lifespan can elapse before it is considered expired */
export const RTR_AT_TTL_FRACTION = 0.8;

/**
 * events that constitute "activity" and will prolong the session.
 * overridden in stripes.config.js::config.rtr.activityEvents.
 */
export const RTR_ACTIVITY_EVENTS = ['keydown', 'mousedown'];

/**
 * how long does an idle session last?
 * When this interval elapses without activity, the session will end and
 * the user will be signed out. This value must be shorter than the RT's TTL,
 * otherwise the RT will expire while the session is still active, leading to
 * a problem where the session appears to be active because the UI is available
 * but the first action that makes and API request (which will fail with an
 * RTR error) causes the session to end.
 *
 * overridden in stripes.configs.js::config.rtr.idleSessionTTL
 * value must be a string parsable by ms()
 */
export const RTR_IDLE_SESSION_TTL = '60m';

/**
 * how long is the "keep working?" modal visible
 * This interval describes how long the "keep working?" modal should be
 * visible before the idle-session timer expires. For example, if
 * RTR_IDLE_SESSION_TTL is set to "60m" and this value is set to "1m",
 * then the modal will be displayed after 59 minutes of inactivity and
 * be displayed for one minute.
 *
 * overridden in stripes.configs.js::config.rtr.idleModalTTL
 * value must be a string parsable by ms()
 */
export const RTR_IDLE_MODAL_TTL = '1m';

/**
 * When resuming an existing session but there is no token-expiration
 * data in the session, we can't properly schedule RTR.
 * 1. the real expiration data is in the cookie, but it's HTTPOnly
 * 2. the resume-session API endpoint, _self, doesn't include
 *    token-expiration data in its response
 * 3. the session _should_ contain a value, but maybe the session
 *    was corrupt.
 * Given the resume-session API call succeeded, we know the AT must have been
 * valid at the time, so we punt and schedule rotation in the future by this
 * (relatively short) interval.
 */
export const RTR_AT_EXPIRY_IF_UNKNOWN = '10s';
