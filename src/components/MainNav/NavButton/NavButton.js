import React from 'react';
import css from './NavButton.css';

const propTypes = {
  href: React.PropTypes.string,
  title: React.PropTypes.string,
  onClick: React.PropTypes.func,
  onKeyDown: React.PropTypes.func,
  children: React.PropTypes.node.isRequired,
  md: React.PropTypes.string, // eslint-disable-line
};

function NavButton(props) {
  function getClass() {
    const base = css.navButton;
    const hide = props.md === 'hide' ? css.hideMed : '';
    return `${base} ${hide}`;
  }

  const { children, md, bsRole, bsClass, ...buttonProps } = props; // eslint-disable-line

  if (props.href) {
    return (
      <a
        className={getClass()}
        {...buttonProps}
      >
        {props.children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={getClass()}
      {...buttonProps}
    >
      <span>
        {children}
      </span>
    </button>
  );
}

NavButton.propTypes = propTypes;

export default NavButton;
