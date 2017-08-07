import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  color: PropTypes.string,
  icon: PropTypes.element,
};

const defaultProps = {
  color: '#999',
};

const NavIcon = (props) => {
  const frameStyle = {
    fill: 'none',
    stroke: '#999',
  };

  const rootStyle = {
    marginLeft: '4px',
    marginRight: '4px',
  };

  const icon = props.icon || (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" style={rootStyle}>
    <rect width="22" height="22" fill={props.color} />
    {props.border ? <rect width="22" height="22" style={frameStyle} /> : null}
  </svg>);

  return icon;
};

NavIcon.propTypes = propTypes;
NavIcon.defaultProps = defaultProps;

export default NavIcon;
