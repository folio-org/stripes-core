import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import { isEqual } from 'lodash';

import { withModules } from '../Modules';

import {
  updateQueryResource,
  getLocationQuery,
  updateLocation,
  getCurrentModule,
  isQueryResourceModule,
  getQueryResourceState,
} from '../../locationService';

// onMount of stripes, sync the query state to the location.
class QueryStateUpdater extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      listen: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
    modules: PropTypes.shape({
      app: PropTypes.arrayOf(PropTypes.object),
    }),
    queryClient: PropTypes.shape({
      removeQueries: PropTypes.func.isRequired,
    }).isRequired,
    stripes: PropTypes.shape({
      store: PropTypes.shape({
        subscribe: PropTypes.func.isRequired,
      }),
    }),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  }

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
  }

  componentDidMount() {
    let curQuery = getLocationQuery(this.props.location);
    const prevQueryState = {};

    this._unsubscribe = this.store.subscribe(() => {
      const { history, location } = this.props;
      const module = this.curModule;

      if (module && isQueryResourceModule(module, location)) {
        const { moduleName } = module;
        const queryState = getQueryResourceState(module, this.store);

        // only update location if query state has changed
        if (!isEqual(queryState, prevQueryState[moduleName])) {
          curQuery = updateLocation(module, curQuery, this.store, history, location);
          prevQueryState[moduleName] = queryState;
        }
      }
    });

    // remove QueryProvider cache to be 100% sure we're starting from a clean slate.
    this.props.queryClient.removeQueries();
  }

  componentDidUpdate(prevProps) {
    const { modules, location } = this.props;
    this.curModule = getCurrentModule(modules, location);
    if (this.curModule && !isEqual(location, prevProps.location)) {
      updateQueryResource(location, this.curModule, this.store);
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  render = () => this.props.children;
}

export default compose(
  injectIntl,
  withRouter,
  withModules,
)(QueryStateUpdater);
