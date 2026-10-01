/**
 * AppIcon interactor
 */

import { interactor, isPresent, find, text, property, attribute } from '@folio/stripes-testing';
import { selectorFromClassnameString } from '../../../../test/bigtest/helpers/render-helpers';
import css from '../AppIcon.css';

const iconClassSelector = selectorFromClassnameString(`.${css.appIcon}`);

export default interactor(class AppIconInteractor {
  static defaultScope = iconClassSelector;

  hasImg = isPresent('img');
  img = find('img');
  label = text();
  tag = property('tagName');
  className = attribute('class');
});
