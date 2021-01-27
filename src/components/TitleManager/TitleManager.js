import React from 'react';
import PropTypes from 'prop-types';
import { Titled } from 'react-titled';
import { withStripes } from '../../StripesContext';

const APP = 'FOLIO';

class TitleManager extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    prefix: PropTypes.string,
    page: PropTypes.string,
    record: PropTypes.string,
    stripes: PropTypes.shape({
      config: PropTypes.shape({
        platformName: PropTypes.string,
      }),
    }).isRequired,
  }

  static defaultProps = { prefix: '' }

  renderTitle = (currentTitle) => {
    const { prefix, page, record } = this.props;

    if (typeof currentTitle !== 'string') return '';

    const tokens = currentTitle.split(' - ');
    if (page) tokens[0] = page;
    if (record) tokens[1] = record;

    tokens[2] = (this.props.stripes.config || {}).platformName || APP;

    return prefix + tokens
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

export default withStripes(TitleManager);
