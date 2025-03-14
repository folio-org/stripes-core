import React from 'react';
import { before, afterEach, beforeEach, describe, it } from 'mocha';
import {
  HTML,
  TextField,
  Button,
  including,
  Bigtest,
} from '@folio/stripes-testing';

import setupApplication from '../helpers/setup-core-application';
import useCustomFields from '../../../src/useCustomFields';

const DropdownButton = Bigtest.Button.extend('dropdown button')
  .selector('button[aria-expanded]')
  .filters({
    ariaLabel: el => el.ariaLabel
  });

const UseCustomFieldsInteractor = HTML.extend('UseCustomField')
  .selector('body')
  .filters({
    error: el => Boolean(el.querySelector('#error')),
    loading: el => Boolean(el.querySelector('#loading')),
    customFields: el => Boolean(el.querySelector('#custom-fields li')),
    customFieldsText: el => el.querySelector('#custom-fields')?.innerText,
  })
  .actions({
    fillUserName: async ({ find }, value) => { await find(TextField({ id: 'input-username' })).fillIn(value); },
    fillPassword: async ({ find }, value) => { await find(TextField({ id: 'input-password' })).fillIn(value); },
    clickLogin: async ({ find }) => { await find(Button({ id: 'clickable-login' })).click(); },
    clickProfileDropdown: async ({ find }) => { await find(DropdownButton({ ariaLabel: including('profile') })).click(); },
    clickLogout: async ({ find }) => { await find(Button({ id: 'clickable-logout' })).click(); },
  });

const setupWithApp = (App, title) => setupApplication({
  disableAuth: false, // Can't skip login flow bc we need to fetch module info
  modules: [{
    type: 'app',
    name: '@folio/ui-login',
    displayName: 'login.title',
    route: '/login',
    hasSettings: false,
    module: () => {},
  }, {
    type: 'app',
    name: '@folio/ui-dummy',
    displayName: 'dummy.title',
    route: '/dummy',
    hasSettings: false,
    module: App,
  }],
  translations: {
    'dummy.title': title,
    'login.title': 'login title',
  },
});

const createCustomFieldRenderer = (interfaceId, interfaceVersion) => (
  () => {
    const [customFields = [], error, loading] = useCustomFields(interfaceId, interfaceVersion);

    if (error) return <div id="error">{error}</div>;
    if (loading) return <div id="loading">Loading...</div>;

    return (
      <ul id="custom-fields">
        {/* eslint-disable-next-line react/prop-types */}
        {customFields.map(cf => <li key={cf.name}>{cf.name}</li>)}
      </ul>
    );
  }
);



describe('useCustomFields hook', () => {
  const i = UseCustomFieldsInteractor();

  const doLogin = async function () {
    await i.fillUserName('username');
    await i.fillPassword('password');
    await i.clickLogin();
    await this.visit('/dummy');
  };

  beforeEach(doLogin);

  describe('requests for existing custom fields', () => {
    before(async () => {
      await setupWithApp(createCustomFieldRenderer('users'), 'Existing Custom Fields');
    });

    it('should have custom fields', () => i.has({ customFields: true, customFieldsText: including('Sponsor information') }));
  });

  describe('requests for non-existing custom fields', () => {
    before(async () => {
      await setupWithApp(createCustomFieldRenderer('foobar'), 'Non-existing Custom Fields');
    });

    it('should have error - non-existing', () => i.has({ error: true }));
  });

  describe('requests for version-incompatible custom fields', () => {
    before(async () => {
      await setupWithApp(createCustomFieldRenderer('users', '1.0'), 'Version-incompatible Custom Fields');
    });

    it('should have error - version-incompatible', () => i.has({ error: true }));
  });

  describe('requests for version-compatible custom fields', () => {
    before(async () => {
      await setupWithApp(createCustomFieldRenderer('users', '42.0'), 'Version-compatible Custom Fields');
    });

    it('should have custom fields', () => () => i.has({ customFields: true, customFieldsText: including('Sponsor information') }));
  });
});
