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

  async componentDidMount() {
    try {
      const { stripes } = this.props;
      const moduleData = await getModules(stripes.config);
      const modules = this.translateModules(moduleData);

      this.setState({ modules });
    } catch (error) {
      console.error('Failed to load modules:', error); // eslint-disable-line no-console
    }
  }

  translateModules = (originalModules) => {
    return {
      app: (originalModules.app || []).map(this.translateModule),
      plugin: (originalModules.plugin || []).map(this.translateModule),
      settings: (originalModules.settings || []).map(this.translateModule),
      handler: (originalModules.handler || []).map(this.translateModule),
    };
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
