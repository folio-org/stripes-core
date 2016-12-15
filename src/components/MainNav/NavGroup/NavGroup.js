import React from 'react';
import css from './NavGroup.css';

const propTypes = {
  children: React.PropTypes.node.isRequired,
};

function NavGroup(props) {
  function getClass() {
    const base = css.navGroup;
    const hide = props.md === 'hide' ? css.hideMed : null;
    return `${base} ${hide}`;
  }

  return (
    <ul className={getClass()}>
      {
        React.Children.map(props.children, (child, i) => <li key={`navItem-${i}`}>{child}</li>)
      }
    </ul>
  );
}

NavGroup.propTypes = propTypes;

export default NavGroup;
