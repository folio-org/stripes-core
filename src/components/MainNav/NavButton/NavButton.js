import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { Badge, Icon } from '@folio/stripes-components';

import AppIcon from '../../AppIcon';

import css from './NavButton.css';

const propTypes = {
  ariaLabel: PropTypes.string,
  href: PropTypes.string,
  label: PropTypes.node,
  title: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  iconKey: PropTypes.string,
  iconData: PropTypes.object, // Alternative way of passing icon data
  icon: PropTypes.oneOfType([
    PropTypes.element,
  ]),
  innerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  badge: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onClick: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.bool,
  noSelectedBar: PropTypes.bool,
  to: PropTypes.string,
};

const defaultProps = {
  noSelectedBar: false,
};

const NavButton = React.forwardRef(({
  ariaLabel,
  badge,
  className,
  href,
  icon,
  iconData,
  iconKey,
  id,
  innerClassName,
  label,
  labelClassName,
  noSelectedBar,
  onClick,
  open,
  selected,
  title,
  to,
  ...rest
}, ref) => {
  /**
   * Root classes
   */
  const rootClasses = classNames(
    css.navButton,
    { [css.selected]: selected },
    { [css.noSelectedBar]: noSelectedBar },
    className,
  );

  /**
   * Icon
   */
  const renderedIcon = (
    <span className={css.icon}>
      {icon || (
        <AppIcon
          alt=""
          app={iconKey}
          icon={iconData}
          focusable={false}
          className={css.appIcon}
        />
      )}
    </span>
  );

  let Element = 'span';
  let clickableProps = {};
  const isInteractive = href || onClick || to;

  /**
   * Is link
   */
  if (href) {
    Element = 'a';
    clickableProps = {
      href,
    };
  }

  /**
   * Is router link (use react-router link)
   */
  if (to) {
    Element = Link;
    clickableProps = {
      to,
    };
  }

  /**
   * Is button (with onClick handler)
   */
  if (typeof onClick === 'function') {
    Element = 'button';
    clickableProps = {
      onClick,
    };
  }

  return (
    <Element ref={ref} id={id} aria-label={ariaLabel || title} className={rootClasses} {...rest} {...clickableProps}>
      <span className={classNames(css.inner, { [css.isInteractive]: isInteractive }, innerClassName)}>
        { badge && (<Badge color="red" className={css.badge}>{badge}</Badge>) }
        { renderedIcon }
        { label && <span className={classNames(css.label, labelClassName)}>{label}</span>}
        {typeof open === 'boolean' && (
          <Icon
            iconRootClass={css.caretIcon}
            icon={open ? 'caret-up' : 'caret-down'}
          />
        )}
      </span>
    </Element>
  );
});

NavButton.propTypes = propTypes;
NavButton.defaultProps = defaultProps;

export default NavButton;
