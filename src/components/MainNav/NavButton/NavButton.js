import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Link from 'react-router-dom/Link';
import AppIcon from '@folio/stripes-components/lib/AppIcon';
import Badge from '@folio/stripes-components/lib/Badge';
import css from './NavButton.css';

const propTypes = {
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
  labelClassName: PropTypes.string,
  badge: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  noSelectedBar: PropTypes.bool,
};

const defaultProps = {
  noSelectedBar: false,
};

const NavButton = React.forwardRef(({ label, title, selected, onClick, href, icon, noSelectedBar, className, labelClassName, badge, id, iconKey, iconData }, ref) => {
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
  const displayIcon = (<span className={css.icon}>{icon || <AppIcon app={iconKey} icon={iconData} focusable={false} />}</span>);

  let Element = 'span';
  let clickableProps = {};

  /**
   * Is link (use react-router link)
   */
  if (href) {
    Element = Link;
    clickableProps = {
      to: href,
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
    <Element ref={ref} id={id} title={title} className={rootClasses} role="button" {...clickableProps}>
      <span className={classNames(css.inner, { [css.isInteractable]: href || onClick })}>
        { badge && (<Badge color="red" className={css.badge}>{badge}</Badge>) }
        { displayIcon }
        { label && <span className={classNames(css.label, labelClassName)}>{label}</span>}
      </span>
    </Element>
  );
});

NavButton.propTypes = propTypes;
NavButton.defaultProps = defaultProps;

export default NavButton;
