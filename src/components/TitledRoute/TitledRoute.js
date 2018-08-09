import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';

import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';

import { withStripes } from '../../StripesContext';
import TitleManager from '../TitleManager';

class TitledRoute extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    component: PropTypes.element,
    stripes: PropTypes.shape({
      intl: PropTypes.shape({
        formatMessage: PropTypes.func,
      })
    })
  }

  render() {
    const { name, component, stripes, ...rest } = this.props;
    const formattedName = stripes.intl.formatMessage({
      id: `stripes-core.title.${name}`,
      defaultMessage: name,
    });

    return (
      <Route
        {...rest}
        render={() => (
          <ErrorBoundary>
            <TitleManager page={formattedName} />
            {component}
          </ErrorBoundary>
        )}
      />
    );
  }
}

export default withStripes(TitledRoute);
