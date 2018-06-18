import React from 'react';
import PropTypes from 'prop-types';

import TitleManager from '../TitleManager';

import css from './MainContainer.css';

const propTypes = {
  children: PropTypes.node.isRequired,
};

function MainContainer(props) {
  return (
    <TitleManager title="FOLIO">
      <div className={css.root}>
        {props.children}
      </div>
    </TitleManager>
  );
}

MainContainer.propTypes = propTypes;

export default MainContainer;
