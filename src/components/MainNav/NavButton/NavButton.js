import React from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/Link';
import css from './NavButton.css';

const propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  children: PropTypes.node.isRequired,
  md: PropTypes.string, // eslint-disable-line
  selected: PropTypes.bool,
};

function NavButton(props) {
  function getClass() {
    const base = css.navButton;
    const hide = props.md === 'hide' ? css.hideMed : '';
    return `${base} ${hide}`;
  }

  const { children, md, bsRole, bsClass, href, ...buttonProps } = props; // eslint-disable-line

  if (props.href) {
    return (
      <Link
        className={getClass()}
        to={href}
        {...buttonProps}
      >
        {props.selected && <div className={css.selected} />}
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={getClass()}
      {...buttonProps}
    >
      <span>
        {props.selected && <div className={css.selected} />}
        {children}
      </span>
    </button>
  );
}

NavButton.propTypes = propTypes;

export default NavButton;
