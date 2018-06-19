import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';

import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';

import TitleManager from '../TitleManager';

class TitledRoute extends React.Component {
  static propTypes = {
    displayName: PropTypes.string,
    component: PropTypes.element,
  }

  render() {
    const { displayName, component, ...rest } = this.props;

    return (
      <Route
        {...rest}
        component={() => (
          <ErrorBoundary>
            <TitleManager page={displayName} />
            {component}
          </ErrorBoundary>
        )}
      />
    );
  }
}

export default TitledRoute;
