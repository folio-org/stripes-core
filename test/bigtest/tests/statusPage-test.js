import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import { Interactor } from '@bigtest/interactor';

import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-application';

describe('Forgot username form test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit('/check-email');
  });

  const statusPage = new Interactor('[data-test-status-page]');
  const mainHeading = new Interactor('[data-test-h1]');
  const cautionParagraph = new Interactor('[data-test-p]');

  describe('Check email status page tests', () => {
    it('Should display a status page to the user', () => {
      expect(statusPage.isPresent).to.be.true;
    });

    it('Should display a header', () => {
      expect(mainHeading.isPresent).to.be.true;
    });

    it(`Should have the header with an appropriate text content 
    equal to check email label in english translation`, () => {
      expect(mainHeading.text).to.equal(translations['label.check.email']);
    });

    it('Should display a paragraph with precautions', () => {
      expect(cautionParagraph.isPresent).to.be.true;
    });

    it(`Should have the paragraph with an appropriate text content 
    equal to check email precautions label in english translation`, () => {
      expect(cautionParagraph.text).to.equal(
        translations['label.caution.email']
      );
    });
  });
});
