import React from 'react';
import PropTypes from 'prop-types';
import { withModules } from '../Modules';
import { stripesShape } from '../../Stripes';
import { ModuleHierarchyProvider } from '../ModuleHierarchy';

import { getEventHandlers } from '../../handlerService';

class HandlerManager extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    event: PropTypes.string,
    data: PropTypes.object,
    modules: PropTypes.shape({
      handler: PropTypes.arrayOf(PropTypes.object),
    }),
    props: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { event, stripes, modules, data } = props;
    this.components = getEventHandlers(event, stripes, modules.handler, data);
  }

  render() {
    const { stripes, data, props } = this.props;
    return (this.components.map(Component => (
      <ModuleHierarchyProvider key={Component.name} module={Component.module.module}>
        <Component stripes={stripes} actAs="handler" data={data} {...props} />
      </ModuleHierarchyProvider>
    )));
  }
}

export default withModules(HandlerManager);
