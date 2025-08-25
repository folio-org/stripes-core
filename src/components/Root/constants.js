/** dispatched during RTR when it is successful */
export const RTR_SUCCESS_EVENT = '@folio/stripes/core::RTRSuccess';

/** dispatched during RTR if RTR itself fails */
export const RTR_ERROR_EVENT = '@folio/stripes/core::RTRError';

/** dispatched if window isn't focused when RTR is attempted */
export const RTR_DELAYED_NOT_FOCUSED = '@folio/stripes/core::RTRDelayedNotFocused';

/**
 * dispatched if the session is idle (without activity) for too long
 */
export const RTR_TIMEOUT_EVENT = '@folio/stripes/core::RTRIdleSessionTimeout';

/** dispatched when the fixed-length session is about to end */
export const RTR_FLS_WARNING_EVENT = '@folio/stripes/core::RTRFLSWarning';

/** dispatched when the fixed-length session ends */
export const RTR_FLS_TIMEOUT_EVENT = '@folio/stripes/core::RTRFLSTimeout';

/**
 * how long is the FLS warning visible?
 * When a fixed-length session expires, the session ends immediately and the
 * user is forcibly logged out. This interval describes how much warning they
 * get before the session ends.
 *
 * overridden in stripes.config.js::config.rtr.fixedLengthSessionWarningTTL
 * value must be a string parsable by ms()
 */
export const RTR_FLS_WARNING_TTL = '1m';

/** BroadcastChannel for cross-window activity pings */
export const RTR_ACTIVITY_CHANNEL = '@folio/stripes/core::RTRActivityChannel';

/**
 * how much of a token's lifespan can elapse before it is considered expired?
 * For the AT, we want a very safe margin because we don't ever want to fall
 * off the end of the AT since it would be a very misleading failure given
 * the RT is still good at that point. Since rotation happens in the background
 * (i.e. it isn't a user-visible feature), rotating early has no user-visible
 * impact.
 */
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
 * overridden in stripes.config.js::config.rtr.idleSessionTTL
 * value must be a string parsable by ms()
 */
export const RTR_IDLE_SESSION_TTL = '4h';

/**
 * how long is the "keep working?" modal visible
 * This interval describes how long the "keep working?" modal should be
 * visible before the idle-session timer expires. For example, if
 * RTR_IDLE_SESSION_TTL is set to "60m" and this value is set to "1m",
 * then the modal will be displayed after 59 minutes of inactivity and
 * be displayed for one minute.
 *
 * overridden in stripes.config.js::config.rtr.idleModalTTL
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
 * Given the resume-session API call succeeded, we know the tokens were valid
 * at the time so we punt and schedule rotation in the very near future because
 * the rotation-response _will_ contain token-expiration values we can use to
 * replace these.
 */
export const RTR_AT_EXPIRY_IF_UNKNOWN = '10s';
export const RTR_RT_EXPIRY_IF_UNKNOWN = '10m';

/**
 * To account for minor delays between events (such as cookie expiration and API calls),
 * this is a small amount of time to wait so the proper order can be ensured if they happen simultaneously.
 */
export const RTR_TIME_MARGIN_IN_MS = 200;

/**
 * Used by RTR logic to determine the priority window - only windows with matching ID's can rotate.
*/
export const SESSION_ACTIVE_WINDOW_ID = '@folio/stripes/core::activeWindowId';

/** Message type for the BroadcastChannel to indicate the active window */
export const RTR_ACTIVE_WINDOW_MSG = '@folio/stripes/core::activeWindowMessage';
/** Message channel for the BroadcastChannel to indicate the active window */
export const RTR_ACTIVE_WINDOW_MSG_CHANNEL = '@folio/stripes/core::activeWindowMessageChannel';
