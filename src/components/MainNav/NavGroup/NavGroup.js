import React from 'react';
import css from './NavGroup.css';

class NavGroup extends React.Component{
  constructor(props){
    super(props);
  }
  
  getGroupStyle(){
    let groupStyle = css.navGroup;
    groupStyle += this.props.md === 'hide'? ' ' + css.hideMed : '';
    return groupStyle;
  }
  
  render(){
    return(
      <ul className={this.getGroupStyle()}>
        {
          React.Children.map(this.props.children, function(child, i){
            return <li key={"navItem-" + i}>{child}</li>;
          }, this)
        }
      </ul>
    )
  }
  
}

export default NavGroup


