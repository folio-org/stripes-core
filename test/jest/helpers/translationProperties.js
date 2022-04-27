import stripesComponentsTranslations from '@folio/stripes-components/translations/stripes-components/en';
import stripesCoreTranslations from '@folio/stripes-core/translations/stripes-core/en';

import translations from '../../../translations/ui-users/en';

const translationsProperties = [
  {
    prefix: 'ui-users',
    translations,
  },
  {
    prefix: 'stripes-components',
    translations: stripesComponentsTranslations,
  },
  {
    prefix: 'stripes-core',
    translations: stripesCoreTranslations,
  }
];

export default translationsProperties;
