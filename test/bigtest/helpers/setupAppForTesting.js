import React from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryHistory as createHistory } from 'history';

import { clearContext, setContext, getContext } from '@folio/stripes-testing/bigtest';

/**
 * Creates a div with an ID and appends it into the `$root` element.
 *
 * @private
 * @param {String} id - Div ID
 * @param {Node} $root - Element to append the div into
 * @returns {Node} The appended div element
 */
let $container = null;
function insertNode() {
  if (!$container) {
    $container = document.createElement('div');
    $container.id = 'root';
    document.body.appendChild($container);
  }

  return createRoot($container);
}

/**
 * Cleans up any component that was mounted by previously calling
 * `mount`, and clears the current context used by other helpers.
 *
 * The `teardown` option provided to the previous `mount` function
 * will be called when using this helper. If a promise is returned,
 * the cleanup will not happen until after that promise resovles.
 *
 * @function cleanup
 * @returns {Promise} Resolves after unmounting the component and
 * clearing the current context
 */
export function cleanup() {
  const {
    node,
    teardown = () => {}
  } = getContext('mountOptions', false) || {};

  // maybe teardown
  return Promise.resolve().then(teardown)
  // unmount any existing node and clear the context
    .then(() => {
      if (node) {
        node.unmount();
      }

      clearContext();
    });
}

/**
 * TestComponent mounts the given component in a container
 * that occupies the full viewport, then calls the callback
 * via a ref after cDM.
 * @param {React.component} component React component to instantiate
 * @param {function} callback function to call after cDM
 * @returns
 */
const TestComponent = ({ component, callback }) => (
  <div style={{ width: '100vh', height: '100vw' }} ref={callback}>{component}</div>
);

/**
 * Mounts the component within a freshly inserted dom node. If there
 * was a component previously mounted by this function, the `cleanup`
 * helper is automatically used to safely unmount it and clear any
 * existing context.
 *
 * ``` javascript
 * await mount(() => (
 *   <SomeComponent foo="bar">
 *     <SomeOtherComponent/>
 *   </SomeComponent>
 * ))
 * ```
 *
 * The ID given to the mounting node can be customized by providing a
 * `mountId` option, and where the node is inserted into can be
 * controlled by providing a `rootElement`.
 *
 * The `setup` hook is called after cleaning up the previously mounted
 * component, and the new component is not mounted until after any
 * resulting promise resolves.
 *
 * The `teardown` hook is called on the next invokation of `cleanup`,
 * either by using it directly, or by calling `mount` again. Cleanup
 * will not complete until any optional promise returned from
 * `teardown` resolves.
 *
 * @function mount
 * @param {Component} component - The component to mount
 * @param {String} [options.mountId="testing-root"] - The ID given to
 * the insterted mounting node.
 * @param {Node} [options.rootElement=document.body] - The root
 * element the new node will be insterted into.
 * @param {Function} [options.setup] - Called after cleaning up the
 * previously mounted component but before mounting the new
 * component. If a promise is returned, the component will not be
 * mounted until after the promise resolves.
 * @param {Function} [options.teardown] - Called when `cleanup` is
 * used after mounting the component, or when `mount` is used
 * again. If a promise is returned, the component will not be
 * unmounted until after the promise resolves.
 * @returns {Promise} Resolves after the component has been mounted
 * into the newly inserted DOM node.
 */
function mount(Component, options = {}) {
  const {
    mountId = 'testing-root',
    rootElement = document.body,
    setup = () => {},
    teardown
  } = options;

  // maybe clean & setup
  return cleanup().then(setup)
  // create a fresh mount node for the component
    .then(() => new Promise(resolve => {
      const node = insertNode(mountId, rootElement);
      setContext({ mountOptions: { node, teardown } });
      node.render(<TestComponent component={<Component />} callback={resolve} />);
    }));
}


/**
 * Returns `true` or `false` if the component specifies a prop type in
 * it's static `propTypes`.
 *
 * @private
 * @param {Component} Component - Component class
 * @param {String} propType - Prop type name
 * @returns {Boolean} If the prop is accepted or not
 */
function hasPropType(Component, propType) {
  // yes, we know these prop-types are from an external component
  // and that they could change at any time. _that
  // eslint-disable-next-line react/forbid-foreign-prop-types
  return !!Component.propTypes && propType in Component.propTypes;
}

/**
 * Mounts an application component in the DOM with additional
 * properties useful for testing. Using the `props` option, you may
 * provide any custom properties to the app component.
 *
 * ``` javascript
 * setupAppForTesting(App, {
 *   props: { testing: true },
 *   setup: () => server = startMockServer(),
 *   teardown: () => server.shutdown()
 * })
 * ```
 *
 * If the application component accepts a `history` property, and one
 * was not already provided via `props`, an in-memory history object
 * is created which can then be used with routers such as [React
 * Router]().
 *
 * The `history` object is kept in a context which is used by the
 * `visit` helpers to make it easy to navigate your app. The `visit`
 * helpers will not work unless `setupAppForTesting` is called at
 * least once.
 *
 * ``` javascript
 * // `history` must be defined as a prop type
 * App.propTypes = {
 *   history: PropTypes.object
 * }
 *
 * // if this is not called, the visit helpers will throw errors
 * setupAppForTesting(App)
 *
 * // forwards to `history.push`
 * visit('/someroute')
 * visit({ pathname: '/foo', search: '?bar' })
 *
 * // other history helpers
 * goBack()
 * goForward()
 * ```
 *
 * Every time a new component is mounted via the `setupAppForTesting`
 * or `mount` helpers, or when using the `cleanup` helper, the
 * previous component is unmounted and the context is cleared.
 *
 * ``` javascript
 * setupAppForTesting(App)
 * visit('/someroute')
 * cleanup()
 *
 * visit('/someroute')
 * //=> Error: undefined history context
 * ```
 *
 * @function setupAppForTesting
 * @param {Component} App - The Application component class to mount
 * with additional properties
 * @param {Object} [options] - Mounting options passed along to `mount`
 * @param {Object} [options.props] - Additional props to pass to the
 * App component when it renders
 * @returns {Promise} Resolves with the app instance after it has been
 * mounted in the DOM
 */
export function setupAppForTesting(App, options = {}) {
  const { props: originalProps = {}, ...mountOptions } = options;

  // ensure we don't mutate the incoming object
  const props = Object.assign({}, originalProps);

  // create an in-memory history object
  if (hasPropType(App, 'history') && !('history' in props)) {
    Object.assign(props, { history: createHistory() });
  }

  // save a reference to the app
  if (Object.getPrototypeOf(App) === React.Component) {
    Object.assign(props, { ref: app => setContext({ app }) });
  }

  // mount with props & options
  return mount(() => <App {...props} />, mountOptions)
    .then(() => {
      // save the history context after mounting
      if ('history' in props) {
        setContext({ history: props.history });
      }

      // always resolve with the app if possible
      return getContext('app', false) || null;
    });
}
