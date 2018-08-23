import React from 'react';
import PropTypes from 'prop-types';
import { withModules } from '../Modules';
import { stripesShape } from '../../Stripes';

import { getHandlerComponents } from '../../handlerService';

class HandlerManager extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    event: PropTypes.number,
    data: PropTypes.object,
    modules: PropTypes.shape({
      handler: PropTypes.array,
    }),
  };

  constructor(props) {
    super(props);
    const { event, stripes, modules, data } = props;
    this.components = getHandlerComponents(event, stripes, modules.handler, data);
  }

  render() {
    const { stripes, data } = this.props;
    return (this.components.map(Component =>
      (<Component key={Component.name} stripes={stripes} data={data} />)));
  }
}

export default withModules(HandlerManager);
