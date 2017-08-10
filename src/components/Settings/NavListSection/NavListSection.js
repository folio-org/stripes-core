import React from 'react';
import PropTypes from 'prop-types';
import css from './NavListSection.css';

const propTypes = {
  label: PropTypes.string,
  activeLink: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

function NavListSection(props) {
  function cloneChild(child) {
    const newProps = {};

    if (props.activeLink.startsWith(child.props.to)) {
      newProps.className = css.active;
    }
    const elemProps = Object.assign({}, newProps, child.props);
    return React.cloneElement(child, elemProps, child.props.children);
  }

  const links = React.Children.map(props.children, cloneChild);
  return (
    <div>
      <div className={css.listTopLabel}>{props.label}</div>
      <nav className={css.listRoot}>
        {links}
      </nav>
    </div>
  );
}

NavListSection.propTypes = propTypes;

export default NavListSection;
