import React from 'react';
import PropTypes from 'prop-types';

class GlobalErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      error: false,
    };
  }

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    const { error } = this.state;
    if (error) {
      return <h1>{error.message}</h1>;
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
