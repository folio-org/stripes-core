import React from 'react';
import css from './NavDivider.css';

const propTypes = {
  md: React.PropTypes.string, //temporary as we work out the responsiveness of the header.
};

function NavDivider(props) {
  function getClass() {
    const base = css.navDivider;
    const hide = props.md === 'hide' ? css.hideMed : null;
    return `${base} ${hide}`;
  }

  return <div className={getClass()} />;
}

NavDivider.propTypes = propTypes;

export default NavDivider;

