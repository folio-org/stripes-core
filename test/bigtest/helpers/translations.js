import componentTranslations from '@folio/stripes-components/translations/stripes-components/en';
import coreTranslations from '../../../translations/stripes-core/en';

const { keys, assign } = Object;

function prefixKeys(pre, obj) {
  return keys(obj).reduce((memo, key) => {
    return assign(memo, { [`${pre}.${key}`]: obj[key] });
  }, {});
}

const defaultTranslations = {
  en: {
    ...prefixKeys('stripes-core', coreTranslations),
    ...prefixKeys('stripes-components', componentTranslations)
  }
};

export default function withTranslations(server, translations = {}) {
  // eslint-disable-next-line
  server.pretender.get(`${__webpack_public_path__}translations/:file`, req => {
    const [lang] = req.params.file.split('-');

    return [200, {}, JSON.stringify({
      ...defaultTranslations[lang] || {},
      ...translations[lang] || {}
    })];
  });
}
