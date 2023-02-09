/* This component is exported from stripes-core for
* use in modules to expose a context menu of module-specific functions
* to be rendered in FOLIO's main navigation.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withAppCtxMenu } from './AppCtxMenuContext';

class AppContextMenu extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool,
    children: PropTypes.func,
    onToggle: PropTypes.func,
    register: PropTypes.func,
    deregister: PropTypes.func,
  }

  componentDidMount() {
    const { register } = this.props;
    register();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && prevProps.open !== this.props.open) {
      this.forceUpdate();
    }
  }

  componentWillUnmount() {
    const { deregister } = this.props;
    deregister();
  }

  render() {
    const { children, onToggle, open } = this.props;
    const menu = children(onToggle);
    const container = document.getElementById('App_context_dropdown_menu');

    if (container) {
      return ReactDOM.createPortal(
        menu,
        container
      );
    } else if (open) {
      onToggle();
    }

    return null;
  }
}

export default withAppCtxMenu(AppContextMenu);
