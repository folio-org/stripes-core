import React from 'react';
import css from '../NavListSection/NavListSection.css';

const propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.node),
    React.PropTypes.node,
  ]),
};

class NavList extends React.Component {
  constructor(props) {
    super(props);

    this.nav = null;
    this.handleNavigationClick = this.handleNavigationClick.bind(this);
  }

  handleNavigationClick(e) {
    const activeLink = this.nav.querySelector(`.${css.active}`);
    if (activeLink) { activeLink.classList.remove(css.active); }
    e.target.classList.add(css.active);
  }

/* eslint-disable */   
  render() {
    return (
      <nav ref={(ref) => { this.nav = ref; }} onClick={this.handleNavigationClick} >
        {this.props.children}
      </nav>
    );
  }
}
/* eslint-enable */

NavList.propTypes = propTypes;

export default NavList;
