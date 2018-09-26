import { interactor, collection } from '@bigtest/interactor';

const navSelector = '[class^="navRoot---"]';

export default @interactor class AppInteractor {
  nav = collection(title => `${navSelector} a[title="${title}"]`);
}
