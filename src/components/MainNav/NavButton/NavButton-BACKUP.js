import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import AppIcon from '@folio/stripes-components/lib/AppIcon';
import Link from 'react-router-dom/Link';
import css from './NavButton.css';

const propTypes = {
  href: PropTypes.string,
  label: PropTypes.string,
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
    return classNames(
      base,
      hide,
      { [css.isSelected]: props.selected },
    );
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
        <AppIcon />
        <span className={css.label}>{props.label}</span>
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
