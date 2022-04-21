import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, it, describe } from '@bigtest/mocha';
import { expect } from 'chai';
import { interactor, count, scoped, is } from '@bigtest/interactor';

import { mountWithContext } from '../../test/bigtest/helpers/render-helpers';
import StaleBundleWarning from './StaleBundleWarning';

const SbwInteractor = interactor(class AppIconInteractor {
  static defaultScope = '[data-test-app-list]';

  itemsCount = count('[data-test-app-list-item]');
  dropdownToggle = scoped('[data-test-app-list-apps-toggle]', {
    isFocused: is(':focus')
  });
});

describe('StaleBundleWarning', () => {
  const appList = new SbwInteractor();

  beforeEach(async () => {
    await mountWithContext(
      <BrowserRouter>
        <StaleBundleWarning />
      </BrowserRouter>
    );
  });

  it(`Should render ${apps.length} nav items`, () => {
    expect(appList.itemsCount).to.equal(apps.length);
  });

  describe('opening the appList with a selected app', () => {
    beforeEach(async () => {
      await mountWithContext(
        <BrowserRouter>
          <StaleBundleWarning />
        </BrowserRouter>
      );
    });

    it('focuses the corresponding item for the selected app', () => {
      expect(document.activeElement).to.not.equal(null);
    });
  });
});
