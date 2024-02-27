import CHANNELS from './channels';

const EVENTS = {
  AUTHN: {
    // broadcast: logout
    LOGOUT: `${CHANNELS.AUTHN}::LOGOUT`,
    // dispatch: rtr failure
    RTR_ERROR: `${CHANNELS.AUTHN}::RTR_ERROR`,
    // broadcast: rtr success
    RTR_SUCCESS: `${CHANNELS.AUTHN}::RTR_SUCCESS`,
    // dispatch: session will expire
    IDLE_SESSION_WARNING: `${CHANNELS.AUTHN}::IDLE_SESSION_WARNING`,
    // dispatch: session has expired
    IDLE_SESSION_TIMEOUT: `${CHANNELS.AUTHN}::IDLE_SESSION_TIMEOUT`,
  },
};

export default EVENTS;
