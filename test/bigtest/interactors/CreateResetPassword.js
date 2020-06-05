import {
  interactor,
  scoped,
  property,
  clickable,
} from '@bigtest/interactor';
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';
import MessageBannerInteractor from '@folio/stripes-components/lib/MessageBanner/tests/interactor';

@interactor class ToggleMask {
  toggleMaskButton = clickable('button');
}

@interactor class SubmitForm {
  clickSubmit = clickable('button[type="submit"]');
}

@interactor class CreateResetPasswordInteractor {
  newPassword = new TextFieldInteractor('[data-test-new-password-field]');
  confirmPassword = new TextFieldInteractor('[data-test-confirm-password-field]');
  toggleMask = new ToggleMask('[data-test-change-password-toggle-mask-btn]');
  submitForm = new SubmitForm('[data-test-submit]');
  message = new MessageBannerInteractor();
  submit = scoped('button[type="submit"]', {
    isDisabled: property('disabled'),
  });
}

export default CreateResetPasswordInteractor;
