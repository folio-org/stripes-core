import React from 'react';
//import globalCssReset from '!style!css!normalize.css';
import globalSystemCss from '!style!css!./global.css';

import css from './MainContainer.css';

function MainContainer(props){
    return(
      <div className={css.root}>{props.children}</div>
    );
}

export default MainContainer;


