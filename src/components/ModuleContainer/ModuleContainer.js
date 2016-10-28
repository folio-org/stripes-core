import React from 'react'
import style from './ModuleContainer.css'

function ModuleContainer(props){
    return(
            <div className={style.moduleContainer}>{props.children}</div>
    )
}

export default ModuleContainer


