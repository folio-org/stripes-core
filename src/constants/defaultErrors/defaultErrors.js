import {
  defaultErrorCodes,
  changePasswordErrorCodes,
  forgotFormErrorCodes,
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
  FORGOTTEN_PASSWORD_CLIENT_ERROR: {
    code: forgotFormErrorCodes.UNABLE_LOCATE_ACCOUNT_PASSWORD,
    type: 'error',
  },
  FORGOTTEN_USERNAME_CLIENT_ERROR: {
    code: forgotFormErrorCodes.UNABLE_LOCATE_ACCOUNT,
    type: 'error',
  }
};

export default defaultErrors;
