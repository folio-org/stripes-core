import React from 'react';

class AddContext extends React.Component {
  static propTypes = {
    context: React.PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    children: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array,
    ]),
  };

  static childContextTypes = {
    // It seems wrong that we have to tell this generic component what specific properties to put in the context
    stripes: React.PropTypes.object,
  };

  getChildContext() {
    return this.props.context;
  }

  render() {
    return this.props.children;
  }
}

export default AddContext;
