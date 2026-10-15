import {
  HTML,
  Link
} from '@folio/stripes-testing';

export const AppListInteractor = HTML.extend('App List')
  .selector('[data-test-app-list]')
  .actions({
    choose: ({ find }, linkText) => find(Link(linkText)).click(),
  });
