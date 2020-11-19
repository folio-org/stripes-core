/**
 * AppList tests
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, it, describe } from '@bigtest/mocha';
import { expect } from 'chai';
import { mountWithContext } from '../../../../../test/bigtest/helpers/render-helpers';

import AppList from '../AppList';
import AppListInteractor from './interactor';

import apps from './apps';
import selectedApp from './selectedApp';

describe('AppList', () => {
  const appList = new AppListInteractor();

  beforeEach(async () => {
    await mountWithContext(
      <BrowserRouter>
        <AppList
          apps={apps}
          selectedApp={selectedApp}
          dropdownToggleId="app-list-dropdown-toggle"
        />
      </BrowserRouter>
    );
  });

  it(`Should render ${apps.length} nav items`, () => {
    expect(appList.itemsCount).to.equal(apps.length);
  });

  describe('opening the appList with a selected app', () => {
    beforeEach(async () => {
      await mountWithContext(
        // Simulate very small screen
        <div style={{ width: 150, background: 'yellow' }}>
          <BrowserRouter>
            <AppList
              apps={apps}
              selectedApp={selectedApp}
              dropdownToggleId="xyz"
            />
          </BrowserRouter>
        </div>
      );
      await appList.dropdownToggle.focus();
      await appList.dropdownToggle.click();
    });

    it('focuses the corresponding item for the selected app', () => {
      expect(document.activeElement).to.not.equal(null);
    });

    describe('if the selected app is not present in the list', () => {
      beforeEach(async () => {
        await mountWithContext(
          // Simulate very small screen
          <div style={{ width: 150, background: 'yellow' }}>
            <BrowserRouter>
              <AppList
                apps={apps}
                selectedApp={{ id: 'test-fake-module', route: '/dummy' }}
                dropdownToggleId="xyz"
              />
            </BrowserRouter>
          </div>
        );
        await appList.dropdownToggle.$root.focus();
        await appList.when(() => appList.dropdownToggle.isFocused);
        await appList.dropdownToggle.click();
      });

      it('focuses the first item in the list', () => {
        expect(document.activeElement.id).to.equal(appList.dropdownMenu.items(0).id);
      });
    });
  });

  describe('If there is no apps to show', () => {
    beforeEach(async () => {
      await mountWithContext(
        <BrowserRouter>
          <AppList
            apps={[]}
            selectedApp={{}}
            dropdownToggleId="xyz"
          />
        </BrowserRouter>
      );
    });

    it('Should not render the AppList', () => {
      expect(appList.isPresent).to.equal(false);
    });
  });

  describe('If the screen width is small and there are hidden apps', () => {
    beforeEach(async () => {
      await mountWithContext(
        // Simulate very small screen
        <div style={{ width: 150, background: 'yellow' }}>
          <BrowserRouter>
            <AppList
              apps={apps}
              dropdownToggleId="xyz"
            />
          </BrowserRouter>
        </div>
      );
      await appList.dropdownToggle.$root.focus();
      await appList.when(() => appList.dropdownToggle.isFocused);
      await appList.dropdownToggle.click();
    });

    it('Should render the "all apps" button', () => {
      expect(appList.dropdownToggle.isPresent).to.equal(true);
    });

    it('Should show the apps dropdown on button click', () => {
      expect(appList.dropdownMenu.isVisible).to.equal(true);
    });

    it('Should focus the first item in the dropdown if there is no current app', () => {
      expect(appList.dropdownMenu.items(0).isFocused).to.equal(true);
    });

    describe('Clicking an item inside the app list dropdown', () => {
      beforeEach(async () => {
        await appList.dropdownMenu.items(0).click();
      });

      it('Should close the app dropdown and focus the dropdown toggle', () => {
        expect(appList.dropdownToggle.isFocused).to.equal(true);
      });
    });
  });
});
