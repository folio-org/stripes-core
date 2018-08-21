import React from 'react';
import PropTypes from 'prop-types';
import { withModules } from '../Modules';
import { stripesShape } from '../../Stripes';

class Handlers extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    modules: PropTypes.shape({
      handler: PropTypes.array,
    }),
  };

  constructor(props) {
    super(props);

    const { stripes, modules } = props;

    this.handlers = modules.handler.reduce((acc, m) => {
      const module = m.getModule();
      const handler = module[m.handlerName];
      if (!handler) return acc;
      const component = handler(stripes);
      if (component) {
        acc.push(stripes.connect(component));
      }
      return acc;
    }, []);
  }

  render() {
    const { stripes } = this.props;
    return (this.handlers.map(Component => (<Component stripes={stripes} />)));
  }
}

export default withModules(Handlers);
