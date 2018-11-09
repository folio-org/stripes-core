import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor
class ErrorsContainerInteractor {
  static defaultScope = ('[data-test-errors]');
  errorsContainer = scoped('[class^="AuthErrorsContainer--"]');
}

export default ErrorsContainerInteractor;
