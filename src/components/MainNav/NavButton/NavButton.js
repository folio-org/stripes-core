import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import AppIcon from '@folio/stripes-components/lib/AppIcon';
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
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  noSelectedBar: PropTypes.bool,
};

const defaultProps = {
  noSelectedBar: false,
};

const NavButton = withRouter(({ history, label, title, selected, onClick, href, icon, noSelectedBar, className }) => {
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

  return (
    <button title={title} className={rootClasses} onClick={clickEvent}>
      <div className={css.inner}>
        { displayIcon }
        { label && <span className={css.label}>{label}</span>}
      </div>
    </button>
  );
});

NavButton.propTypes = propTypes;
NavButton.defaultProps = defaultProps;

export default NavButton;
