/**
 * AppList tests
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, it, describe } from 'mocha';
import { HTML, Bigtest } from '@folio/stripes-testing';
import { mountWithContext } from '../../../../../test/bigtest/helpers/render-helpers';

import AppList from '../AppList';
// import AppListInteractor from './interactor';

import apps from './apps';
import selectedApp from './selectedApp';

const AppDropdownInteractor = HTML.extend('app dropdown')
  .selector('[data-test-app-list]')
  .filters({
    itemCount: el => el.querySelectorAll('[class^=navItem--]').length,
  })
  .actions({
    focusDropdownTrigger: ({ find }) => find(Bigtest.Button('Apps')).focus(),
    clickDropdownTrigger: ({ find }) => find(Bigtest.Button('Apps')).click()
  });

const AppNavMenuItem = HTML.extend('app dropdown item')
  .selector('[data-test-nav-list-item]')
  .locator(el => el.textContent);

const AppMenuInteractor = HTML.extend('app menu')
  .selector('[class^=DropdownMenu]')
  .filters({
    itemCount: el => el.querySelectorAll('[data-test-item-link]').length,
    focusedIndex: el => {
      if (!el.querySelector(':focus')) return -1;
      const focused = el.querySelector(':focus');
      return [...focused.parentNode.children].indexOf(focused);
    }
  })
  .actions({
    clickItem: async ({ find }, label) => {
      await find(AppNavMenuItem(label)).click();
    }
  });

describe('AppList', () => {
  const appsNav = AppDropdownInteractor();
  const appsDropdown = AppMenuInteractor();

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

  it(`Should render ${apps.length} nav items`, () => appsNav.has({ itemCount: apps.length }));

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
      await appsNav.focusDropdownTrigger();
      await appsNav.clickDropdownTrigger();
    });

    it('focuses the corresponding item for the selected app', () => AppMenuInteractor({ focusedIndex: -1 }).absent());

    describe('if the selected app is not present in the list', () => {
      beforeEach(async () => {
        await mountWithContext(
          // Simulate very small screen
          <div style={{ width: 150, background: 'DimGray' }}>
            <BrowserRouter>
              <AppList
                apps={apps}
                selectedApp={{ id: 'test-fake-module', route: '/dummy' }}
                dropdownToggleId="xyz"
              />
            </BrowserRouter>
          </div>
        );
        await appsNav.focusDropdownTrigger();
        await appsNav.clickDropdownTrigger();
      });

      it('focuses the first item in the list', () => appsDropdown.has({ focusedIndex: 0 }));
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

    it('Should not render the AppList', () => appsDropdown.absent());
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
      await appsNav.focusDropdownTrigger();
      await appsNav.clickDropdownTrigger();
    });

    it('Should render the "all apps" button', () => appsNav.exists());

    it('Should show the apps dropdown on button click', () => appsDropdown.exists());

    it('Should focus the first item in the dropdown if there is no current app', () => appsDropdown.has({ focusedIndex: 0 }));

    describe('Clicking an item inside the app list dropdown', () => {
      beforeEach(async () => {
        await appsDropdown.clickItem('Inventory');
      });

      it('Should close the app dropdown and focus the dropdown toggle', () => Bigtest.Button('Apps').is({ focused: true }));
    });
  });
});
