import React from 'react';
import css from './NavListSection.css';

const propTypes = {
  label: React.PropTypes.string,
  activeLink: React.PropTypes.string,
  children: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.node),
    React.PropTypes.node,
  ]),
};

function NavListSection(props) {
  function cloneChild(child) {
    const newProps = {};
    if (props.activeLink === child.props.href) {
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
