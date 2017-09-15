import React from 'react';
import PropTypes from 'prop-types';
import css from './NavGroup.css';

const propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string, // eslint-disable-line
  md: PropTypes.string,
};

function NavGroup(props) {
  function getClass() {
    const base = css.navGroup;
    const hide = props.md === 'hide' ? css.hideMed : '';
    const additional = props.className ? props.className : '';
    return `${base} ${hide} ${additional}`;
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
