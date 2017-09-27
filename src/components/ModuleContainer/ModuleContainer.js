import React from 'react';
import PropTypes from 'prop-types';
import style from './ModuleContainer.css';

const propTypes = {
  children: PropTypes.node.isRequired,
};

function ModuleContainer(props) {
  return (
    <div className={style.moduleContainer} id="ModuleContainer">{props.children}</div>
  );
}

ModuleContainer.propTypes = propTypes;

export default ModuleContainer;
