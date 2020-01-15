import React from 'react';

import {
  describe,
  beforeEach,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';

import { when } from '@bigtest/convergence';
import { Response } from 'miragejs';

import setupApplication from '../helpers/setup-application-components';
import mount from '../helpers/mount';
import connectStripes from '../helpers/connectStripes';
import TestForm from '../helpers/TestForm';

import PasswordValidationField from '../../../src/components/CreateResetPassword/components/PasswordValidationField';

const ConnectedField = connectStripes(PasswordValidationField);

describe('PasswordValidationField', () => {
  const field = new TextFieldInteractor();

  setupApplication();

  beforeEach(async function () {
    let rulesLoaded = false;

    // return rules for testing password validations
    this.server.get('/tenant/rules', (schema, request) => {
      rulesLoaded = true;

      // stripes-connect requires `X-Request-URL` header for `response.url`
      return new Response(200, { 'X-Request-URL': request.url }, {
        rules: [
          {
            ruleId: '5105b55a-b9a3-4f76-9402-a5243ea63c95',
            name: 'password_length',
            type: 'RegExp',
            validationType: 'Strong',
            state: 'Enabled',
            moduleName: 'mod-password-validator',
            expression: '^.{8,}$',
            description: 'The password length must be at least 8 characters long',
            orderNo: 0,
            errMessageId: 'password.length.invalid'
          }
        ],
        totalRecords: 1
      });
    });

    // mount the component under test
    mount(
      <TestForm>
        <ConnectedField
          id="password-test"
          name="password"
          label="Test"
          username="test"
        />
      </TestForm>
    );

    // wait for validation to load
    await when(() => rulesLoaded);
  });

  it('is a textfield component', () => {
    expect(field.isPresent).to.be.true;
  });

  describe.skip('with an invalid password', () => {
    beforeEach(async () => {
      await field.fillAndBlur('test');
    });

    it('shows a validation error', () => {
      expect(field.inputError).to.be.true;
    });
  });
});
