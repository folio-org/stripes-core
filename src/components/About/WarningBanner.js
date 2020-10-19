import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Headline,
  List,
  MessageBanner,
} from '@folio/stripes-components';

import { isVersionCompatible } from '../../discoverServices';
import css from './About.css';

const WarningBanner = ({
  interfaces,
  modules,
}) => {
  const [missingModules, setMissingModules] = useState([]);
  const [incompatibleModule, setIncompatibleModule] = useState([]);

  useEffect(() => {
    const modulesArray = _.flatten(_.values(modules));

    modulesArray.forEach(module => {
      const okapiInterfaces = module.okapiInterfaces;
      if (okapiInterfaces) {
        Object.keys(okapiInterfaces).forEach(key => {
          const required = okapiInterfaces[key];
          const available = interfaces[key];

          if (!available) {
            setMissingModules((prevState) => [...prevState, `${key} ${required}`]);
          } else if (available && !isVersionCompatible(available, required)) {
            setIncompatibleModule((prevState) => [...prevState, `${key} ${required}`]);
          }
        });
      }
    });
  }, [modules, interfaces]);

  const missingModulesMsg = <FormattedMessage id="stripes-core.about.missingModuleCount" values={{ count: _.compact(missingModules).length }} />;
  const incompatibleModuleMsg = <FormattedMessage id="stripes-core.about.incompatibleModuleCount" values={{ count: _.compact(incompatibleModule).length }} />;

  return (
    <div className={css.warningContainer}>
      <MessageBanner
        type="warning"
        show={_.compact(missingModules).length}
        dismissable
      >
        <Headline>{missingModulesMsg}</Headline>
        <List
          listStyle="bullets"
          items={missingModules}
        />
      </MessageBanner>

      <MessageBanner
        type="warning"
        show={_.compact(incompatibleModule).length}
        dismissable
      >
        <Headline>{incompatibleModuleMsg}</Headline>
        <List
          listStyle="bullets"
          items={incompatibleModule}
        />
      </MessageBanner>
    </div>
  );
};

WarningBanner.propTypes = {
  modules: PropTypes.object,
  interfaces: PropTypes.object,
};

export default WarningBanner;
