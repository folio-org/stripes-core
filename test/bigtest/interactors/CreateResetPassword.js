import {
  interactor,
  scoped,
  property,
  clickable,
} from '@bigtest/interactor';
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';

@interactor class ToggleMask {
  toggleMaskButton = clickable('button');
}

@interactor class CreateResetPasswordInteractor {
  newPassword = new TextFieldInteractor('[data-test-new-password-field]');
  confirmPassword = new TextFieldInteractor('[data-test-confirm-password-field]');
  message = scoped('div[class^="AuthErrorsContainer--"]');
  toggleMask = new ToggleMask('[data-test-change-password-toggle-mask-btn]');

  submit = scoped('button[type="submit"]', {
    isDisabled: property('disabled'),
  });
}

export default CreateResetPasswordInteractor;
