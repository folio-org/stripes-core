import React from 'react';
import PropTypes from 'prop-types';

import { withLastVisited } from '../LastVisited';

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

export default withLastVisited(MainContainer);
