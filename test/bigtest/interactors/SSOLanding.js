import {
  interactor,
  isPresent,
} from '@bigtest/interactor';


export default @interactor
class SSOLandingInteractor {
  isValid = isPresent('[data-test-sso-success]');
  isError = isPresent('[data-test-sso-error]');
}
