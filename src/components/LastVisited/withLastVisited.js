import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { withModules } from '../Modules';
import LastVisitedContext from './LastVisitedContext';

function withLastVisited(WrappedComponent) {
  class LastVisited extends React.Component {
    static propTypes = {
      history: PropTypes.shape({
        listen: PropTypes.func.isRequired,
      }).isRequired,
      modules: PropTypes.shape({
        app: PropTypes.array,
      }),
    };

    constructor(props) {
      super();

      const { modules, history } = props;

      this.moduleList = modules.app.concat({
        route: '/settings',
        module: '@folio/x_settings',
      });

      this.cachePreviousUrl = this.cachePreviousUrl.bind(this);
      this.previousModules = [];
      this.lastVisited = {};
      this.previous = {};

      history.listen((location) => {
        const module = this.getCurrentModule(location);
        if (!module) return;

        // When switching modules, clear the record cache older than previous module to keep memory from growing unbounded. Refs UIIN-687.
        if (this.previousModules.length > 1) {
          if (this.previousModules.indexOf(module.module) < 0) {
            this.props.stripes.store.dispatch({
              type: '@@stripes-connect/PRUNE',
              meta: {
                resource: 'records',
                module: this.previousModules[0],
              }
            });
          }

          // Remove the oldest module from future pruning
          this.previousModules.shift();
        }

        this.previousModules.push(module.module);
        const name = module.module.replace(/^@folio\//, '');
        this.previous[name] = this.lastVisited[name];
        this.lastVisited[name] = `${location.pathname}${location.search}`;
        this.currentName = name;
      });
    }

    getCurrentModule(location) {
      return this.moduleList.find(entry => (location.pathname === entry.route ||
        location.pathname.startsWith(`${entry.route}/`)));
    }

    cachePreviousUrl() {
      const name = this.currentName;
      this.lastVisited[name] = this.previous[name];
    }

    render() {
      const value = {
        lastVisited: this.lastVisited,
        cachePreviousUrl: this.cachePreviousUrl
      };

      return (
        <LastVisitedContext.Provider value={value}>
          <WrappedComponent {...this.props} />
        </LastVisitedContext.Provider>
      );
    }
  }

  return hoistNonReactStatics(LastVisited, WrappedComponent);
}

export default compose(
  withRouter,
  withModules,
  withLastVisited,
);
