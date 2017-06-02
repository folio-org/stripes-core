import React from 'react';
// import globalCssReset from '!style!css!normalize.css';
import globalSystemCss from '!style-loader!css-loader!./global.css'; // eslint-disable-line

import css from './MainContainer.css';

const propTypes = {
  children: React.PropTypes.node.isRequired,
};

function MainContainer(props) {
  return (
    <div className={css.root}>{props.children}</div>
  );
}

MainContainer.propTypes = propTypes;

export default MainContainer;
