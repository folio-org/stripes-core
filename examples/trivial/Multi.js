import React from 'react';
import PropTypes from 'prop-types';
import About from './About';

class Multi extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedAbout = props.stripes.connect(About);
  }

  render() {
    return (
      <div>
        <this.connectedAbout stripes={this.props.stripes} dataKey="1" />
        <this.connectedAbout stripes={this.props.stripes} dataKey="2" />
      </div>
    );
  }
}

export default Multi;
