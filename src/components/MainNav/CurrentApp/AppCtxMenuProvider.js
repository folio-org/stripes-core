/* This component wraps the FOLIO UI in order to catch
* occurrences of AppContextMenu rendered within a
* UI module. It supplies an open/close state, a toggle handler, and registration/
* deregistration functions used by AppContextMenu via context.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { AppCtxMenuContext } from './AppCtxMenuContext';

class AppCtxMenuProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node
  }

  state = {
    open: false, // eslint-disable-line react/no-unused-state
    onToggle: this.handleToggle.bind(this), // eslint-disable-line react/no-unused-state
    register: this.register.bind(this), // eslint-disable-line react/no-unused-state
    deregister: this.deregister.bind(this), // eslint-disable-line react/no-unused-state
    displayDropdownButton: false, // eslint-disable-line react/no-unused-state
  }

  register() {
    this.setState({
      displayDropdownButton: true, // eslint-disable-line react/no-unused-state
    });
  }

  deregister() {
    this.setState({
      displayDropdownButton: false, // eslint-disable-line react/no-unused-state
      open: false, // eslint-disable-line react/no-unused-state
    });
  }

  handleToggle() {
    this.setState((currentState) => ({
      open: !currentState.open
    }));
  }

  render() {
    const { children } = this.props;
    return (
      <AppCtxMenuContext.Provider value={this.state}>
        {children}
      </AppCtxMenuContext.Provider>
    );
  }
}

export default AppCtxMenuProvider;
