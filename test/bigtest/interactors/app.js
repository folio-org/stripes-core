import {
  interactor,
  scoped,
  collection,
} from '@bigtest/interactor';

import {
  HTML,
  Link
} from '@folio/stripes-testing';

const navSelector = '[class^="navRoot---"]';

export default @interactor class AppInteractor {
  nav = collection(title => `${navSelector} a[aria-label="${title}"]`);
  helpButton = scoped('[data-test-item-help-button]');
}

export const AppListInteractor = HTML.extend('App List')
  .selector('[data-test-app-list]')
  .actions({
    choose: ({ find }, linkText) => find(Link(linkText)).click(),
  });
