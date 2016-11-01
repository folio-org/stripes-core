import React from 'react';
import style from './NavButton.css';

function NavButton(props){
    if(!props.href){
      return(
        <button type="button" className={style.navButton} title={props.title} onClick={props.onClick}>{props.children}</button>
      );
    }else{
      return(
        <a href={props.href} title={props.title} className={style.navButton} onClick={props.onClick}>{props.children}</a>
      );
    }
}

export default NavButton;

