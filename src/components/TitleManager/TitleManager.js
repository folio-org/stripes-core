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
    const { prefix, page, record, stripes } = this.props;
    const postfix = stripes.config?.platformName || APP;

    if (typeof currentTitle !== 'string') return '';

    const tokens = currentTitle.split(' - ');

    /**
     * When there are 2 items - that means there are page and postfix.
     * If we don't clear the tokens[1] item then we'll have two postfixes - in tokens[1] and tokens[2] will be added later
     */
    if (tokens.length === 2) {
      tokens[1] = '';
    }

    if (page) tokens[0] = page;
    if (record) tokens[1] = record;

    tokens[2] = postfix;

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
