import { IntlProvider } from 'react-intl';

import translationsJson from '../../../translations/stripes-core/en';

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
  ...prefixKeys(translationsJson, 'stripes-core'),
};

const Intl = ({ children }) => (
  <IntlProvider
    locale="en"
    messages={translations}
  >
    {children}
  </IntlProvider>
);

export default Intl;
