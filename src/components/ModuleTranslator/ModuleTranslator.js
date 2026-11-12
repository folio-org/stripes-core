import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { withStripes } from '../../StripesContext';
import { getModules } from '../../entitlementService';
import {
  ModulesContext,
  modulesInitialState,
} from '../../ModulesContext';

class ModuleTranslator extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    intl: PropTypes.object,
    stripes: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      modules: modulesInitialState,
    };
  }

  componentDidMount() {
    const { stripes } = this.props;
    getModules(stripes.config).then(moduleData => {
      const modules = this.translateModules(moduleData);
      // state is set after awaiting the fetched modules, not synchronously on mount
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ modules });
    })
    .catch(error => {
      console.error('Failed to load modules:', error); // eslint-disable-line no-console
    });
  }

  /**
   * iterate over modulesInitialState and translate the modules names. 
   * The keys in modulesInitialState are the different actsAs types. The outer
   * map iterates over those keys, plucking the corresponing values out of the
   * newly-loaded module data after cDM runs getModules(). The inner map passes
   * each package in that list of types through `translateModule()`, adding the
   * `displayName` key to its translations.
   */
  translateModules = (originalModules) => {
    return Object.fromEntries(
      Object.keys(modulesInitialState).map(k => [k, (originalModules[k] || []).map(this.translateModule)])
    );
  }

  translateModule = (module) => {
    const { formatMessage } = this.props.intl;

    return {
      ...module,
      displayName: module.displayName ? formatMessage({ id: module.displayName }) : undefined,
    };
  }

  render() {
    return (
      <ModulesContext.Provider value={this.state.modules}>
        { this.props.children }
      </ModulesContext.Provider>
    );
  }
}

export default withStripes(injectIntl(ModuleTranslator));
