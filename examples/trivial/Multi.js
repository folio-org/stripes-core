import React from 'react';
import About from './About';

class Multi extends React.Component {
  constructor(props) {
    console.log('constructing Multi, props =', props);
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
};

export default Multi;
