/**
 * CurrentApp interactor
 */

import { interactor, scoped, attribute, text } from '@bigtest/interactor';

export default interactor(class CurrentAppInteractor {
  homeButton = scoped('[data-test-current-app-home-button]', {
    ariaLabel: attribute('aria-label'),
    label: text(),
  })

  contextMenuToggleButton = scoped('[data-test-context-menu-toggle-button]');
  contextMenu = scoped('[data-test-context-menu]');
});
