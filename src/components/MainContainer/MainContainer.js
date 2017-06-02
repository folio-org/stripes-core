import React from 'react';
import globalSystemCss from '!style-loader!css-loader!./global.css'; // eslint-disable-line
import { withRouter } from 'react-router';

import css from './MainContainer.css';

class MainContainer extends React.Component {
  static propTypes = {
    children: React.PropTypes.node.isRequired,
    history: React.PropTypes.shape({
      listen: React.PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    props.history.listen((hist, op) => {
      // eslint-disable-next-line no-console
      console.log('MainContainer history changed: hist =', hist, 'op =', op);
    });
  }

  render() {
    return (
      <div className={css.root}>{this.props.children}</div>
    );
  }
}

export default withRouter(MainContainer);
