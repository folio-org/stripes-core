import React from 'react';
import PropTypes from 'prop-types';

import css from './MainContainer.css';

const propTypes = {
  children: PropTypes.node.isRequired,
};

function MainContainer(props) {
  return (
    <div className={css.root}>{props.children}</div>
  );
}

MainContainer.propTypes = propTypes;

export default MainContainer;
