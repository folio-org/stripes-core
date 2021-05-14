import {
  interactor,
  scoped,
  collection,
} from '@bigtest/interactor';

const navSelector = '[class^="navRoot---"]';

export default @interactor class AppInteractor {
  nav = collection(title => `${navSelector} a[aria-label="${title}"]`);
  helpButton = scoped('[data-test-item-help-button]');
}
