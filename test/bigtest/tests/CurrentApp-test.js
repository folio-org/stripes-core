/**
 * CurrentApp tests
 */

import React from 'react';
import { before, beforeEach, it, describe } from 'mocha';
import { Bigtest, DropdownMenu, including } from '@folio/stripes-testing';
import setupApplication from '../helpers/setup-application';
import AppContextMenu from '../../../src/components/MainNav/CurrentApp/AppContextMenu';

const { Link, Button } = Bigtest;

const HomeButton = Link.extend('home button')
  .selector('[data-test-current-app-home-button]')
  .filters({
    ariaLabel: el => el.ariaLabel
  });

const DummyAppWithContextMenu = () => (
  <div>
    <AppContextMenu>
      {() => (
        <div data-test-context-menu>
          App context menu content..
        </div>
      )}
    </AppContextMenu>
  </div>
);

const DummyAppWithoutContextMenu = () => <div />;

describe('CurrentApp', () => {
  const homeButton = HomeButton('Dummy app without context menu');
  const contextDropdownToggle = Button(including('Dummy app with context menu'));

  before(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1900);
    });
  });

  setupApplication({
    modules: [
      {
        type: 'app',
        name: '@folio/dummy-app-with-app-context-menu',
        displayName: 'dummy.with.context.menu.title',
        route: '/dummy-app-with-app-context-menu',
        module: DummyAppWithContextMenu
      },
      {
        type: 'app',
        name: '@folio/dummy-app-without-app-context-menu',
        displayName: 'dummy.without.context.menu.title',
        route: '/dummy-app-without-app-context-menu',
        module: DummyAppWithoutContextMenu
      },
    ],
    translations: {
      'dummy.with.context.menu.title': 'Dummy app with context menu',
      'dummy.without.context.menu.title': 'Dummy app without context menu'
    }
  });

  describe('When the <AppContextMenu> is present in an app', () => {
    beforeEach(async function visit() {
      await this.visit('/dummy-app-with-app-context-menu');
    });

    it('Should render a context menu toggle button', () => contextDropdownToggle.exists());

    describe('Clicking the context menu toggle button', () => {
      beforeEach(async () => {
        await contextDropdownToggle.click();
      });

      it('Should open the app context menu dropdown', () => DropdownMenu().exists());
    });
  });

  describe('When the <AppContextMenu> is not present in an app', () => {
    beforeEach(async function visit() {
      await this.visit('/dummy-app-without-app-context-menu');
    });

    it('Should render a home button', () => homeButton.exists());

    it('Should have an aria-label equal to: "Current open application: {displayName} (Click to go home)"', () => {
      return homeButton.has({ ariaLabel: 'Current open application: Dummy app without context menu (Click to go home)' });
    });
  });

  describe('When on the initial route (no active app)', () => {
    it('Should render a heading with a label of "FOLIO"', () => HomeButton('FOLIO').exists());
  });
});
