import React from 'react';
import PropTypes from 'prop-types';

class GlobalErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      error: undefined,
      info: undefined,
    };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    const { error, info } = this.state;
    if (error) {
      return (
        <div>
          <h1>The following error has occurred:</h1>
          <h3>{error.message}</h3>
          <p>{info}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
