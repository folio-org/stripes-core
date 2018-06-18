import React from 'react';
import PropTypes from 'prop-types';
import { Titled } from 'react-titled';

const APP = 'FOLIO';

class TitleManager extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    page: PropTypes.string,
    record: PropTypes.string,
  }

  renderTitle = (currentTitle) => {
    const { page, record } = this.props;

    if (typeof currentTitle !== 'string') return 'Folio';

    const tokens = currentTitle.split(' - ');
    if (page) tokens[0] = page;
    if (record) tokens[1] = record;

    tokens[2] = APP;

    return tokens
      .filter(t => t)
      .join(' - ');
  }

  render() {
    return (
      <Titled title={this.renderTitle}>
        {this.props.children}
      </Titled>
    );
  }
}

export default TitleManager;
