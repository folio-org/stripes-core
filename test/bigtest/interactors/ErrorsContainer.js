import {
  interactor,
} from '@bigtest/interactor';
import MessageBannerInteractor from '@folio/stripes-components/lib/MessageBanner/tests/interactor';

@interactor
class ErrorsContainerInteractor {
  static defaultScope = ('[data-test-errors]');

  errorsContainer = new MessageBannerInteractor();
}

export default ErrorsContainerInteractor;
