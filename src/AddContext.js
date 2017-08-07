import React from 'react';
import PropTypes from 'prop-types';

class AddContext extends React.Component {
  static propTypes = {
    context: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
    ]),
  };

  static childContextTypes = {
    // It seems wrong that we have to tell this generic component what specific properties to put in the context
    stripes: PropTypes.object,
  };

  getChildContext() {
    return this.props.context;
  }

  render() {
    return this.props.children;
  }
}

export default AddContext;
