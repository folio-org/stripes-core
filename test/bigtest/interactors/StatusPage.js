import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor
class StatusPageInteractor {
  static defaultScope = ('[data-test-status-page]');
  heading = scoped('[data-test-h1]');
  cautionParagraph = scoped('[data-test-p]');
}

export default StatusPageInteractor;
