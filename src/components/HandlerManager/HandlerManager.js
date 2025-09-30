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
    this.state = {
      components: [],
    };
  }

  componentDidMount() {
    this.updateComponents();
  }

  componentDidUpdate(prevProps) {
    const { modules } = this.props;

    if (prevProps.modules !== modules) {
      this.updateComponents();
    }
  }

  updateComponents() {
    const { event, stripes, modules, data } = this.props;

    const components = getEventHandlers(event, stripes, modules.handler, data);
    this.setState({ components });
  }

  render() {
    const { stripes, data, props } = this.props;
    const { components } = this.state;

    return components.map(Component => (
      <ModuleHierarchyProvider key={Component.name} module={Component.module.module}>
        <Component stripes={stripes} actAs="handler" data={data} {...props} />
      </ModuleHierarchyProvider>
    ));
  }
}

export default withModules(HandlerManager);
