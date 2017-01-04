import { reducer as form } from 'redux-form';
import okapiReducer from './okapiReducer';

export default {
  // TODO: here's where you'd pull in a reducer to handle Okapi actions like auth
  okapi: okapiReducer,
  form,
};
