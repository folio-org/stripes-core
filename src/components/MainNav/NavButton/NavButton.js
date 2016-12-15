import React from 'react';
import css from './NavButton.css';

const propTypes = {
  href: React.PropTypes.string,
  title: React.PropTypes.string,
  onClick: React.PropTypes.func,
  children: React.PropTypes.node.isRequired,
  md: React.PropTypes.string, //temporary as we work out the responsiveness of the header.
};

function NavButton(props) {
  function getClass() {
    const base = css.navButton;
    const hide = props.md === 'hide' ? css.hideMed : null;
    return `${base} ${hide}`;
  }

  if (props.href) {
    return (
      <a
        href={props.href}
        title={props.title}
        className={getClass()}
        onClick={props.onClick}
      >
        {props.children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={getClass()}
      title={props.title}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

NavButton.propTypes = propTypes;

export default NavButton;
