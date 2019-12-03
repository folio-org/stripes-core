/**
 * AppListDropdown interactor
 */

import { interactor, scoped, is, collection, attribute } from '@bigtest/interactor';

export default interactor(class AppListDropdownInteractor {
  static defaultScope = '[data-test-app-list-dropdown]';

  activeItem = scoped('[data-test-app-list-dropdown-current-item="true"]', {
    isFocused: is(':focus'),
  });

  items = collection('[data-test-app-list-dropdown-item]', {
    isFocused: is(':focus'),
    id: attribute('id'),
  });
});
