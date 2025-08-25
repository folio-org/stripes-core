import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useDeepCompareMemo } from 'use-deep-compare';

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
  bannerRef
}) => {
  const allInterfaces = useDeepCompareMemo(() => {
    const modulesArray = _.flatten(_.values(modules));

    return modulesArray.reduce((prev, curr) => Object.assign(prev, curr.okapiInterfaces), {});
  }, [modules]);

  const missingModules = useDeepCompareMemo(
    () => Object.entries(allInterfaces)
      .filter(([key]) => !(key in interfaces))
      .map(([key, value]) => `${key} ${value}`),
    [allInterfaces, interfaces]
  );

  const incompatibleModules = useDeepCompareMemo(
    () => Object.entries(allInterfaces)
      .filter(([key]) => (key in interfaces) && !isVersionCompatible(interfaces[key], allInterfaces[key]))
      .map(([key, value]) => `${key} ${value}`),
    [allInterfaces, interfaces]
  );

  const missingModulesCount = missingModules.length;
  const incompatibleModulesCount = incompatibleModules.length;
  const missingModulesMsg = <FormattedMessage id="stripes-core.about.missingModuleCount" values={{ count: missingModulesCount }} />;
  const incompatibleModuleMsg = <FormattedMessage id="stripes-core.about.incompatibleModuleCount" values={{ count: incompatibleModulesCount }} />;

  return (
    <div className={css.warningContainer}>
      <MessageBanner
        type="warning"
        show={!!missingModulesCount}
        dismissable
        ref={bannerRef}
      >
        <Headline>{missingModulesMsg}</Headline>
        <List
          listStyle="bullets"
          items={missingModules}
        />
      </MessageBanner>

      <MessageBanner
        type="warning"
        show={!!incompatibleModulesCount}
        dismissable
        ref={bannerRef}
      >
        <Headline>{incompatibleModuleMsg}</Headline>
        <List
          listStyle="bullets"
          items={incompatibleModules}
        />
      </MessageBanner>
    </div>
  );
};

WarningBanner.propTypes = {
  modules: PropTypes.object,
  interfaces: PropTypes.object,
  bannerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

export default WarningBanner;
