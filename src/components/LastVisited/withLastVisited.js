import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { withModules } from '../Modules';
import LastVisitedContext from './LastVisitedContext';
import { packageName } from '../../constants';

function withLastVisited(WrappedComponent) {
  class LastVisited extends React.Component {
    static propTypes = {
      history: PropTypes.shape({
        listen: PropTypes.func.isRequired,
      }).isRequired,
      modules: PropTypes.shape({
        app: PropTypes.arrayOf(PropTypes.object),
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
      this.lastVisited = {};
      this.previous = {};

      history.listen((location) => {
        const module = this.getCurrentModule(location);
        if (!module) return;
        const name = module.module.replace(packageName.PACKAGE_SCOPE_REGEX, '');
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
