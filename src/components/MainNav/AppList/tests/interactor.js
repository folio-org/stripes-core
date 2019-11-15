/**
 * AppList interactor
 */

import { interactor, count, scoped, is } from '@bigtest/interactor';
import AppListDropdownInteractor from '../components/AppListDropdown/tests/interactor';

export default interactor(class AppIconInteractor {
  static defaultScope = '[data-test-app-list]';

  itemsCount = count('[data-test-app-list-item]');
  dropdownToggle = scoped('[data-test-app-list-apps-toggle]', {
    isFocused: is(':focus')
  });

  dropdownMenu = new AppListDropdownInteractor();
});
