import
{
  interactor,
  is,
  triggerable
} from '@bigtest/interactor';
import ButtonInteractor
  from '@folio/stripes-components/lib/Button/tests/interactor';

export default @interactor
class SubmitButtonInteractor {
  static defaultScope = ('button[data-test-submit]');
  buttonInteractor = new ButtonInteractor();
  isDisabled = is(':disabled');
  isClicked = triggerable('click');
}
