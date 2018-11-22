import {
  interactor,
  is,
} from '@bigtest/interactor';
import ButtonInteractor
  from '@folio/stripes-components/lib/Button/tests/interactor';

export default @interactor
class SubmitButtonInteractor {
  static defaultScope = ('button[data-test-submit]');

  button = new ButtonInteractor();
  isDisabled = is(':disabled');
}
