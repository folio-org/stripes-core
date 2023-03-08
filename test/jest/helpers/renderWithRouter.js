import React from 'react';
import { IntlProvider } from 'react-intl';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import componentsTranslations from '@folio/stripes-components/translations/stripes-components/en';
import stripesCoreTranslations from '../../../translations/stripes-core/en';

const prefixKeys = (translations, prefix) => {
  return Object
    .keys(translations)
    .reduce((acc, key) => (
      {
        ...acc,
        [`${prefix}.${key}`]: translations[key],
      }
    ), {});
};

const translations = {
  ...prefixKeys(componentsTranslations, 'stripes-components'),
  ...prefixKeys(stripesCoreTranslations, 'stripes-core'),
};

const history = createMemoryHistory();
const renderWithRouter = children => render(
  <Router history={history}>
    <IntlProvider
      locale="en"
      messages={translations}
    >
      {children}
    </IntlProvider>
  </Router>
);

export default renderWithRouter;
