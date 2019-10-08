/**
 * ResizeContainer interactor
 */

import { interactor, findAll, isPresent, find, text, property, attribute } from '@bigtest/interactor';

export default interactor(class AppIconInteractor {
  static defaultScope = '[data-test-resize-container]';

  visibleItems = findAll('[data-test-resize-container-visible-item]');
  hiddenItems = findAll('[data-test-resize-container-hidden-item]');
});
