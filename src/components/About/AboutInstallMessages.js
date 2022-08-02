import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';

import {
  Headline,
} from '@folio/stripes-components';
import {
  useConfigurations,
  useOkapiEnv,
} from '../../queries';


export function entryFor(config, code) {
  const entry = config?.configs?.find(i => i.code === code);
  return entry ? entry.value : '';
}

/**
 * installVersion
 * Search environment, the mod-configuration, then stripes.config.js
 * for installed-version and installed-date information. Return them,
 * or an empty element.
 *
 * @param {object} env
 * @param {object} conf
 * @param {object} stripesConf stripes.config.js's config object
 * @returns string
 */
export function installVersion(env, conf, stripesConf) {
  return env?.ABOUT_INSTALL_VERSION || entryFor(conf, 'version') || stripesConf?.aboutInstallVersion || '';
}

/**
 * installDate
 * Search environment, the mod-configuration, then stripes.config.js
 * for installed-date information. Return it or an empty string.
 *
 * @param {object} env
 * @param {object} conf
 * @param {object} stripesConf stripes.config.js's config object
 * @returns Component
 */
export function installDate(env, conf, stripesConf) {
  return env?.ABOUT_INSTALL_DATE || entryFor(conf, 'date') || stripesConf?.aboutInstallDate || '';
}

/**
 * installMessage
 * Search environment, then mod-configuration, then stripes.config.js for
 * a configuration message. Return it, or an empty element.
 *
 * @param {object} env
 * @param {object} conf
 * @param {object} stripesConf stripes.config.js's config object
 * @returns Component
 */
export function installMessage(env, conf, stripesConf) {
  return env?.ABOUT_INSTALL_MESSAGE || entryFor(conf, 'message') || stripesConf?.aboutInstallMessage || '';
}

/**
 * Display install-releated information from one of three sources,
 * in descending order of preference (i.e. use a higher-ranked source
 * if available):
 *
 * 1. Environment variables (/_/env)
 *    Search for ABOUT_INSTALL_DATE, ABOUT_INSTALL_VERSION, ABOUT_INSTALL_MESSAGE.
 * 2. mod-configuration (/configurations/entries)
 *    In { module: '@folio/stripes-core', configName: 'aboutInstall' } search for
 *    date, version, message.
 * 3. stripes.config (stripes.config.js).
 *    Search for aboutInstallDate, aboutInstallVersion, aboutInstallVersion
 *
 * @param {} props
 * @returns
 */
const AboutInstallMessages = (props) => {
  const aboutEnv = useOkapiEnv();
  const aboutConfig = useConfigurations({
    module: '@folio/stripes-core',
    configName: 'aboutInstall',
  });

  const version = installVersion(aboutEnv.data, aboutConfig.data, props.stripes.config);
  const date = installDate(aboutEnv.data, aboutConfig.data, props.stripes.config);
  const message = installMessage(aboutEnv.data, aboutConfig.data, props.stripes.config);

  let formattedDate = '';
  if (date) {
    formattedDate = <>(<FormattedDate value={date} />)</>;
  }

  return (
    <>
      {(version || formattedDate) && <Headline size="large">{version} {formattedDate}</Headline>}
      {message && <div>{message}</div>}
    </>
  );
};

AboutInstallMessages.propTypes = {
  stripes: PropTypes.shape({
    config: PropTypes.object,
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

export default AboutInstallMessages;
