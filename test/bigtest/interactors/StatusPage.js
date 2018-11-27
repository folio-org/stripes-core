import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor
class StatusPageInteractor {
  static defaultScope = ('[data-test-status-page]');

  heading = scoped('[data-test-h1]');
  notificationParagraph = scoped('[data-test-p-notification]');
  cautionParagraph = scoped('[data-test-p-caution]');
}

export default StatusPageInteractor;
