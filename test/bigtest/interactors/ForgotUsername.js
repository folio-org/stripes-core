import {
  interactor,
  scoped,
} from '@bigtest/interactor';

import TextFieldInteractor
  from '@folio/stripes-components/lib/TextField/tests/interactor';
import SubmitButtonInteractor from './SubmitButton';
import ErrorsContainerInteractor from './ErrorsContainer';
import StatusPageInteractor from './StatusPage';

@interactor
class ForgotUsernameInteractor {
  static defaultScope = ('form[class^="form--"]');

  inputField = new TextFieldInteractor('[class^="formGroup--"]');
  submitButton = new SubmitButtonInteractor();
  mainHeading = scoped('[data-test-h1]');
  callToActionParagraph = scoped('[data-test-p]');
  errorsWrapper = new ErrorsContainerInteractor();
  statusPage = new StatusPageInteractor();
}

export default ForgotUsernameInteractor;
