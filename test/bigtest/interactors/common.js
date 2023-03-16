import {
  HTML,
  Button,
  TextField,
} from '@folio/stripes-testing';

import translations from '../../../translations/stripes-core/en';

export const Login = HTML.extend('login form')
  .selector('[class^=form--]')
  .locator(el => el.querySelector('h1').innerText)
  .filters({
    errorMessage: el => el.querySelector('[data-test-message-banner]') !== null,
    submitDisabled: Button({ text: 'Log in', disabled: true }).exists()
  })
  .actions({
    fillIn: async ({ find }, values) => {
      await find(TextField({ id: 'input-username' })).fillIn(values.username);
      await find(TextField({ id: 'input-password' })).fillIn(values.password);
      await find(Button(translations['title.login'])).click();
    }
  });

export const StatusPage = HTML.extend('status page')
  .selector('[data-test-status-page]')
  .filters({
    headingText: el => el.querySelector('[data-test-h1]')?.textContent || '',
    notificationText: el => el.querySelector('[data-test-p-notification]')?.textContent || '',
    cautionText: el => el.querySelector('[data-test-p-caution]')?.textContent || '',
  });
