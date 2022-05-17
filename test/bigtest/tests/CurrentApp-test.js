/**
 * CurrentApp tests
 */

import React from 'react';
import { before, beforeEach, it, describe } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import AppContextMenu from '../../../src/components/MainNav/CurrentApp/AppContextMenu';
import CurrentAppInteractor from '../interactors/CurrentApp';

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
  const currentApp = new CurrentAppInteractor();

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

    it('Should render a context menu toggle button', () => {
      expect(currentApp.contextMenuToggleButton.isPresent).to.equal(true);
    });

    describe('Clicking the context menu toggle button', () => {
      beforeEach(async () => {
        await currentApp.contextMenuToggleButton.click();
      });

      it('Should open the app context menu dropdown', () => {
        expect(currentApp.contextMenu.isPresent).to.equal(true);
      });
    });
  });

  describe('When the <AppContextMenu> is not present in an app', () => {
    beforeEach(async function visit() {
      await this.visit('/dummy-app-without-app-context-menu');
    });

    it('Should render a home button', () => {
      expect(currentApp.homeButton.isPresent).to.equal(true);
    });

    it('Should have an aria-label equal to: "Current open application: {displayName} (Click to go home)"', () => {
      expect(currentApp.homeButton.ariaLabel).to.equal('Current open application: Dummy app without context menu (Click to go home)');
    });
  });

  describe('When on the initial route (no active app)', () => {
    it('Should render a heading with a label of "FOLIO"', () => {
      expect(currentApp.homeButton.isPresent).to.equal(true);
      expect(currentApp.homeButton.label).to.equal('FOLIO');
    });
  });
});
