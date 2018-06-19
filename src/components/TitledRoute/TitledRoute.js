import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import { injectIntl, intlShape } from 'react-intl';

import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';

import TitleManager from '../TitleManager';

class TitledRoute extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    component: PropTypes.element,
    intl: intlShape.isRequired,
  }

  render() {
    const { name, component, intl, ...rest } = this.props;
    const formattedName = intl.formatMessage({
      id: `stripes-core.title.${name}`,
      defaultMessage: name,
    });

    return (
      <Route
        {...rest}
        component={() => (
          <ErrorBoundary>
            <TitleManager page={formattedName} />
            {component}
          </ErrorBoundary>
        )}
      />
    );
  }
}

export default injectIntl(TitledRoute);
