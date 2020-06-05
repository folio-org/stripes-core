import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor
class ErrorsContainerInteractor {
  static defaultScope = ('[data-test-errors]');

  errorsContainer = scoped('[data-test-message-banner]');
}

export default ErrorsContainerInteractor;
