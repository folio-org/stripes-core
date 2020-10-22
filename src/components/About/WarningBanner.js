import _ from 'lodash';
import React from 'react';
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
  const modulesArray = _.flatten(_.values(modules));
  const allInterfaces = modulesArray.reduce((prev, curr) => Object.assign(prev, curr.okapiInterfaces), {});

  const missingModules = Object.keys(allInterfaces).reduce((prev, curr) => {
    if (!interfaces[curr]) {
      return [...prev, `${curr} ${allInterfaces[curr]}`];
    } else {
      return prev;
    }
  }, []);

  const incompatibleModule = Object.keys(allInterfaces).reduce((prev, curr) => {
    if (interfaces[curr] && !isVersionCompatible(interfaces[curr], allInterfaces[curr])) {
      return [...prev, `${curr} ${allInterfaces[curr]}`];
    } else {
      return prev;
    }
  }, []);

  const missingModulesCount = _.compact(missingModules).length;
  const incompatibleModulesCount = _.compact(incompatibleModule).length;
  const missingModulesMsg = <FormattedMessage id="stripes-core.about.missingModuleCount" values={{ count: missingModulesCount }} />;
  const incompatibleModuleMsg = <FormattedMessage id="stripes-core.about.incompatibleModuleCount" values={{ count: incompatibleModulesCount }} />;

  return (
    <div className={css.warningContainer}>
      <MessageBanner
        type="warning"
        show={missingModulesCount}
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
        show={incompatibleModulesCount}
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
