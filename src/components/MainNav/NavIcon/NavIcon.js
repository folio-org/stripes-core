import React from 'react';
import PropTypes from 'prop-types';
import AppIcon from '@folio/stripes-components/lib/AppIcon';

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

  const icon = props.icon || (
    <AppIcon size="medium" />
  );

  return icon;
};

NavIcon.propTypes = propTypes;
NavIcon.defaultProps = defaultProps;

export default NavIcon;
