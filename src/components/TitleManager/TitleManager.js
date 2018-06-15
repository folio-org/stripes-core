import React from 'react';
import PropTypes from 'prop-types';
import { Titled } from 'react-titled';

class TitleManager extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string.isRequired,
  }

  render() {
    const { title } = this.props;

    return (
      <Titled title={(currentTitle) => {
        if (currentTitle) return `${title} - ${currentTitle}`;
        return title;
      }}
      >
        {this.props.children}
      </Titled>
    );
  }
}

export default TitleManager;
