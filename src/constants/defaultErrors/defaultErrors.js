import {
  defaultErrorCodes,
  changePasswordErrorCodes,
  ssoErrorCodes,
} from '../index';

const defaultErrors = {
  DEFAULT_LOGIN_CLIENT_ERROR: {
    code: defaultErrorCodes.DEFAULT_ERROR,
    type: 'error',
  },
  DEFAULT_LOGIN_SERVER_ERROR:{
    code: defaultErrorCodes.DEFAULT_SERVER_ERROR,
    type: 'error',
  },
  INVALID_LINK_ERROR: {
    code: changePasswordErrorCodes.INVALID_ERROR_CODE,
    type: 'error',
  },
  SSO_SESSION_FAILED_ERROR: {
    code: ssoErrorCodes.SSO_SESSION_FAILED_ERROR,
    type: 'error',
  },
};

export default defaultErrors;
