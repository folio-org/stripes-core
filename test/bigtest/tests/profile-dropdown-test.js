import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';
import React, { Component } from 'react';
import { Dropdown as DropdownInteractor, HTML, TextField as LoginInteractor } from '@folio/stripes-testing';
import setupApplication from '../helpers/setup-application';

class DummyApp extends Component {
  render() {
    return (<h1>Hello Stripes!</h1>);
  }
}

const ProfileMenuInteractor = HTML.extend('profile menu')
  .selector('div[class*=DropdownMenu]')
  .filters({
    itemCount: el => el.querySelectorAll('[data-test-nav-list-item]').length
  });

describe('Profile dropdown', () => {
  const profileDropdown = DropdownInteractor({ id: 'profileDropdown' });
  const profileMenu = ProfileMenuInteractor();
  const loginInteractor = LoginInteractor({ id: 'input-username' });

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

  it('renders', () => profileDropdown.exists());

  describe('opening the dropdown', () => {
    beforeEach(async () => {
      await profileDropdown.toggle();
    });

    it('displays the appropriate number of links', () => profileMenu.has({ itemCount: 4 }));

    describe('clicking the home link', () => {
      beforeEach(async () => {
        await ProfileMenuInteractor().find(HTML('Home')).click();
      });

      it('changes the url', function () {
        expect(this.location.pathname).to.equal('/');
      });
    });

    describe('clicking a userlink', () => {
      beforeEach(async () => {
        await profileMenu.find(HTML('Okay')).click();
      });

      it('changes the url', function () {
        expect(this.location.pathname).to.equal('/dummy');
      });
    });

    describe('clicking a Change Password link', () => {
      beforeEach(async () => {
        await profileMenu.find(HTML('Change password')).click();
      });

      it('changes the url', function () {
        expect(this.location.pathname).to.equal('/settings/myprofile/password');
      });
    });

    describe('clicking logout', () => {
      beforeEach(async () => {
        await profileMenu.find(HTML('Log out')).click();
      });

      it('changes the url', () => loginInteractor.exists());
    });
  });
});
