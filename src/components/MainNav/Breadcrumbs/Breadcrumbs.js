import React from 'react'
import style from './Breadcrumbs.css'

class Breadcrumbs extends React.Component{
  constructor(props){
      super(props);
  }

  render(){
    let links = [];
    this.props.links.map(function(link, i){
      links.push(<li key={"breadcrumb_" + i}><a href={link.path}>{link.label}</a></li>);
      if(i != this.props.links.length-1){
          links.push(<li key={"divider"+i}>{">"}</li>)
      }
    }, this);
    return(   
      <ul className={style.navBreadcrumbs}>
          {links}
      </ul>
    );
  }
}

export default Breadcrumbs;


