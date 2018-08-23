import React from 'react';
import PropTypes from 'prop-types';
import { withModules } from '../Modules';
import { stripesShape } from '../../Stripes';
import withHandlers from './withHandlers';

class Handlers extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    event: PropTypes.number,
    data: PropTypes.object,
    getComponentsFromHandlers: PropTypes.func,
    modules: PropTypes.shape({
      handler: PropTypes.array,
    }),
  };

  constructor(props) {
    super(props);
    const { event, stripes, modules, getComponentsFromHandlers, data } = props;
    this.components = getComponentsFromHandlers(event, stripes, modules.handler, data);
  }

  render() {
    const { stripes, data } = this.props;
    return (this.components.map(Component =>
      (<Component key={Component.name} stripes={stripes} data={data} />)));
  }
}

export default withModules(withHandlers(Handlers));
