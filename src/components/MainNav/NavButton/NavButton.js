import React from 'react';
import style from './NavButton.css';

function NavButton(props){
    if(!props.href){
      return(
        <button type="button" className={style.navButton} onClick={props.onClick}>{props.children}</button>
      );
    }else{
      return(
        <a href={props.href} className={style.navButton} onClick={props.onClick}>{props.children}</a>
      );
    }
}

export default NavButton;

