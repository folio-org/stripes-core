import React from 'react';
import PropTypes from 'prop-types';
import { Route as RouterRoute } from 'react-router-dom';

export { Switch, Redirect } from 'react-router-dom';

/**
 * Pass the children of a Route to the component that is responsible for rendering it.
 * This allows us to have a single route hierarchy, where the routing
 * components are responsible for marshalling data, and providing high
 * level layout:
 *
 *   // routes.js
 *   <Route component={ParentRoute}>
 *     <Route component={ChildRoute}/>
 *   </Route>
 *
 *   // parent-route.js
 *   import Layout from './layout';
 *   export default class ParentRoute extends Component {
 *     render() {
 *       return (<Layout>{children}</Layout>);
 *     }
 *   }
 *
 * will take all of the children of the top level `Route` component,
 * and pass them as the children of the `ParentRoute` component.
 */
export function Route({ component: Component, children, ...props }) {
  // we currently always provide a component
  /* istanbul ignore else */
  if (Component) {
    return (
      <RouterRoute {...props} render={props => (<Component {...props}>{children}</Component>)} /> // eslint-disable-line no-shadow
    );
  } else {
    return (<RouterRoute {...props}>{children}</RouterRoute>);
  }
}

Route.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]),
  component: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ])
};
