import { describe, beforeEach, it } from '@bigtest/mocha';
import { Interactor } from '@bigtest/interactor';
import { expect } from 'chai';
import React, { Component } from 'react';
import DropdownInteractor from '@folio/stripes-components/lib/Dropdown/tests/interactor';

import setupApplication from '../helpers/setup-application';

class DummyApp extends Component {
  render() {
    return (<h1>Hello Stripes!</h1>);
  }
}

describe('Profile dropdown', () => {
  const dropdown = new DropdownInteractor('#profileDropdown');
  const loginInteractor = new Interactor('[data-test-new-username-field]');

  const modules = [{
    type: 'app',
    name: '@folio/ui-dummy',
    displayName: 'dummy.title',
    route: '/dummy',
    hasSettings: true,
    module: DummyApp,
    links: {
      userDropdown: [
        {
          route: '/dummy',
          caption: 'stripes-core.label.okay'
        },
        {
          route: '/settings/myprofile/password',
          caption: 'stripes-core.title.changePassword'
        },
      ]
    }
  }];

  setupApplication({
    modules,
    translations: {
      'dummy.title': 'Dummy'
    },
    stripesConfig: {
      showHomeLink: true,
      hasAllPerms: false,
      permissions: {
        'ui-myprofile.settings.change-password': true,
      },
    }
  });

  beforeEach(function () {
    this.visit('/dummy');
  });

  it('renders', () => {
    expect(dropdown.triggerDisplayed).to.be.true;
  });

  describe('opening the dropdown', () => {
    beforeEach(async () => {
      await dropdown.clickTrigger();
    });

    it('displays the appropriate number of links', () => {
      expect(dropdown.menu.items().length).to.equal(4);
    });

    describe('clicking the home link', () => {
      beforeEach(async () => {
        await dropdown.menu.items(0).click();
      });

      it('changes the url', function () {
        expect(this.location.pathname).to.equal('/');
      });
    });

    describe('clicking a userlink', () => {
      beforeEach(async () => {
        await dropdown.menu.items(1).click();
      });

      it('changes the url', function () {
        expect(this.location.pathname).to.equal('/dummy');
      });
    });

    describe('clicking a Change Password link', () => {
      beforeEach(async () => {
        await dropdown.menu.items(2).click();
      });

      it('changes the url', function () {
        expect(this.location.pathname).to.equal('/settings/myprofile/password');
      });
    });

    describe('clicking logout', () => {
      beforeEach(async () => {
        await dropdown.menu.items(3).click();
      });

      it('changes the url', () => {
        expect(loginInteractor.isPresent).to.be.true;
      });
    });
  });
});
