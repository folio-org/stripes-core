import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Route from 'react-router-dom/Route';

import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';

import TitleManager from '../TitleManager';

import { withStripes } from '../../StripesContext';

class TitledRoute extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    component: PropTypes.element
  };

  render() {
    const {
      name,
      component,
      computedMatch,
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
            <FormattedMessage id={`stripes-core.title.${name}`} defaultMessage={name}>
              {formattedName => (
                <TitleManager page={formattedName} />
              )}
            </FormattedMessage>
            {componentWithExtraProps}
          </ErrorBoundary>
        )}
      />
    );
  }
}

export default withStripes(TitledRoute);
