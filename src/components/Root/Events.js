/** dispatched during RTR when it is successful */
export const RTR_SUCCESS_EVENT = '@folio/stripes/core::RTRSuccess';

/** dispatched during RTR if RTR itself fails */
export const RTR_ERROR_EVENT = '@folio/stripes/core::RTRError';

/** dispatched if the session is idle without activity for too long */
export const RTR_TIMEOUT_EVENT = '@folio/stripes/core::RTRIdleSessionTimeout';

/** events that constitute "activity" and will prolong the session */
export const RTR_ACTIVITY_EVENTS = ['keydown', 'mousedown'];

export const RTR_ACTIVITY_CHANNEL = '@folio/stripes/core::RTRActivityChannel';
