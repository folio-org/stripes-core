import { interactor, collection } from '@bigtest/interactor';

export default @interactor class AboutInteractor {
  installedApps = collection('[data-test-stripes-core-about-module-versions] [data-test-stripes-core-about-module="app"] li');
}
