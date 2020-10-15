import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Route } from 'react-router-dom';

import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';

import TitleManager from '../TitleManager';

import { withStripes } from '../../StripesContext';

class TitledRoute extends React.Component {
  static propTypes = {
    component: PropTypes.element,
    computedMatch: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
    name: PropTypes.string
  };

  render() {
    const {
      name,
      component,
      computedMatch,
      intl,
      ...rest
    } = this.props;

    const componentWithExtraProps = computedMatch
      ? {
        ...component,
        props: {
          ...component.props,
          match: computedMatch,
        }
      }
      : component;

    return (
      <Route
        {...rest}
        render={() => (
          <ErrorBoundary>
            <TitleManager page={intl.formatMessage({ id: `stripes-core.title.${name}`, defaultMessage: name })} />
            {componentWithExtraProps}
          </ErrorBoundary>
        )}
      />
    );
  }
}

export default withStripes(injectIntl(TitledRoute));
