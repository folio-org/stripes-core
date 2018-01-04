import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import AppIcon from '@folio/stripes-components/lib/AppIcon';
import Badge from '@folio/stripes-components/lib/Badge';
import { withRouter } from 'react-router-dom';
import css from './NavButton.css';

const propTypes = {
  href: PropTypes.string,
  label: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.oneOfType([
    PropTypes.element,
  ]),
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

const NavButton = withRouter(({ history, label, title, selected, onClick, href, icon, noSelectedBar, className, badge }) => {
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
  const displayIcon = (<span className={css.icon}>{icon || <AppIcon focusable={false} />}</span>);

  /**
   * On click
   */
  const clickEvent = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      history.push(href);
    }
  };

  const Element = typeof onClick === 'function' || href ? 'button' : 'span';

  return (
    <Element title={title} className={rootClasses} onClick={clickEvent}>
      <div className={css.inner}>
        { badge && (<Badge color="red" className={css.badge}>{badge}</Badge>) }
        { displayIcon }
        { label && <span className={css.label}>{label}</span>}
      </div>
    </Element>
  );
});

NavButton.propTypes = propTypes;
NavButton.defaultProps = defaultProps;

export default NavButton;
