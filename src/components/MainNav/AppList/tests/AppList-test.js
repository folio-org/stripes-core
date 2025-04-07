/**
 * AppList tests
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, it, describe } from 'mocha';
import { HTML, Bigtest } from '@folio/stripes-testing';
import { mountWithContext } from '../../../../../test/bigtest/helpers/render-helpers';

import AppList from '../AppList';
import selectedApp from './selectedApp';
import settingsIcon from '../../settings.svg';

// disable lint for the double-quotes in all this JSON...
/* eslint-disable quotes */
const apps = [
  {
    "id": "clickable-users-module",
    "href": "/users?sort=name",
    "active": false,
    "name": "users",
    "displayName": "Users",
    "route": "/users",
    "home": "/users?sort=name",
    "queryResource": "query",
    "actionNames": [
      "stripesHome",
      "usersSortByName"
    ],
    "okapiInterfaces": {
      "users": "15.0",
      "configuration": "2.0",
      "circulation": "3.0 4.0 5.0 6.0 7.0 8.0",
      "permissions": "5.0",
      "loan-policy-storage": "1.0 2.0",
      "loan-storage": "4.0 5.0 6.0 7.0",
      "login": "6.0",
      "feesfines": "15.0",
      "request-storage": "2.5 3.0",
      "users-bl": "5.0"
    },
    "module": "@folio/users",
    "description": "User management",
    "version": "2.26.0"
  },
  {
    "id": "clickable-inventory-module",
    "href": "/inventory?filters=&sort=Title",
    "active": false,
    "name": "inventory",
    "displayName": "Inventory",
    "route": "/inventory",
    "home": "/inventory?filters=&sort=Title",
    "queryResource": "query",
    "okapiInterfaces": {
      "inventory": "9.0",
      "instance-storage": "7.0",
      "holdings-storage": "3.0 4.0",
      "item-storage": "7.0",
      "loan-types": "2.0",
      "material-types": "2.0",
      "item-note-types": "1.0",
      "locations": "3.0",
      "identifier-types": "1.1",
      "contributor-types": "2.0",
      "contributor-name-types": "1.2",
      "instance-types": "2.0",
      "nature-of-content-terms": "1.0",
      "instance-formats": "2.0",
      "classification-types": "1.1",
      "statistical-code-types": "1.0",
      "statistical-codes": "1.0",
      "modes-of-issuance": "1.0",
      "instance-statuses": "1.0",
      "instance-relationship-types": "1.0",
      "instance-note-types": "1.0",
      "alternative-title-types": "1.0",
      "holdings-types": "1.0",
      "call-number-types": "1.0",
      "electronic-access-relationships": "1.0",
      "ill-policies": "1.0",
      "holdings-note-types": "1.0",
      "users": "15.0",
      "location-units": "2.0",
      "circulation": "4.0 5.0 6.0 7.0 8.0"
    },
    "translations": {
      "en": {
        "search": "Search",
        "resultCount": "{count, number} {count, plural, one {Record found} other {Records found}}"
      },
      "de": {
        "search": "Suche",
        "resultCount": "Gefunden {count, number} {count, plural, one {Aufzeichnung} other {Aufzeichnungen}}"
      }
    },
    "module": "@folio/inventory",
    "description": "Inventory manager",
    "version": "1.13.0"
  },
  {
    "displayName": "Settings",
    "id": "clickable-settings",
    "href": "/settings",
    "active": false,
    "description": "FOLIO settings",
    "iconData": {
      "src": settingsIcon,
      "alt": "Tenant Settings",
      "title": "Settings"
    },
    "route": "/settings"
  }
];
/* eslint-enable quotes */

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
        <style>
          {`html {
            background-color: #333;
          }`}
        </style>
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
