import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-core-application';
import StatusPageInteractor from '../interactors/StatusPage';

describe('Forgot username form test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit({
      pathname: '/check-email',
      state: { userEmail: '127-699-8925' }
    });
  });

  const statusPage = new StatusPageInteractor();
  const {
    heading,
    notificationParagraph,
    cautionParagraph,
  } = statusPage;

  describe('check email status page tests', () => {
    it('should display a status page to the user', () => {
      expect(statusPage.isPresent).to.be.true;
    });

    it('should display a header', () => {
      expect(heading.isPresent).to.be.true;
    });

    it(`should have the header with an appropriate text content
      equal to check email label in english translation`, () => {
      expect(heading.text).to.equal(translations['label.check.email']);
    });

    it('should display a paragraph with notification', () => {
      expect(notificationParagraph.isPresent).to.be.true;
    });

    it(`should have the paragraph with an appropriate text content
      equal to sent email precautions label in english translation`, () => {
      expect(notificationParagraph.text).to.equal(
        translations['label.your.email']
      );
    });

    it('should display a paragraph with precautions', () => {
      expect(cautionParagraph.isPresent).to.be.true;
    });

    it(`should have the paragraph with an appropriate text content
      equal to check email precautions label in english translation`, () => {
      expect(cautionParagraph.text).to.equal(
        translations['label.caution.email']
      );
    });
  });
});
