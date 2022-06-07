import React from 'react';
import { afterEach, beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-core-application';
import useCustomFields from '../../../src/useCustomFields';

import LoginInteractor from '../interactors/login';
import UseCustomFieldsInteractor from '../interactors/useCustomFields';

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

const i = new UseCustomFieldsInteractor();

const doLogin = async function () {
  const login = new LoginInteractor();
  const { username, password, submit } = login;

  await username.fill('username');
  await password.fill('password');
  await submit.click();
  await submit.blur();
  await this.visit('/dummy');
};

const doLogout = async function () {
  await i.clickProfileDropdown();
  await i.clickLogout();
};

describe.skip('useCustomFields hook', () => {
  describe('requests for existing custom fields', () => {
    setupWithApp(createCustomFieldRenderer('users'), 'Existing Custom Fields');

    beforeEach(doLogin);
    afterEach(doLogout);

    it('should have custom fields', () => {
      expect(i.hasCustomFields).to.be.true;
      expect(i.customFields).to.contain('Sponsor information');
    });
  });

  describe('requests for non-existing custom fields', () => {
    setupWithApp(createCustomFieldRenderer('foobar'), 'Non-existing Custom Fields');

    beforeEach(doLogin);
    afterEach(doLogout);

    it('should have error', () => {
      expect(i.hasError).to.be.true;
    });
  });

  describe('requests for version-incompatible custom fields', () => {
    setupWithApp(createCustomFieldRenderer('users', '1.0'), 'Version-incompatible Custom Fields');

    beforeEach(doLogin);
    afterEach(doLogout);

    it('should have error', () => {
      expect(i.hasError).to.be.true;
    });
  });

  describe('requests for version-compatible custom fields', () => {
    setupWithApp(createCustomFieldRenderer('users', '42.0'), 'Version-compatible Custom Fields');

    beforeEach(doLogin);
    afterEach(doLogout);

    it('should have custom fields', () => {
      expect(i.hasCustomFields).to.be.true;
      expect(i.customFields).to.contain('Sponsor information');
    });
  });
});
