import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, DropdownMenu, Icon } from '@folio/stripes-components';
import { withAppCtxMenu } from './AppCtxMenuContext';
import NavButton from '../NavButton';
import css from './CurrentAppGroup.css';

class AppContextDropdown extends React.Component {
  static propTypes = {
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    icon: PropTypes.node,
    displayName: PropTypes.string,
  }

  render() {
    const {
      onToggle,
      open,
      icon,
      displayName,
    } = this.props;

    const navButtonLabel = (
      <React.Fragment>
        <Icon iconRootClass={css.currentAppDropdownCaret} icon={open ? 'caret-up' : 'caret-down'} />
        {icon}
        <span className="sr-only">
          <FormattedMessage id="mainnav.appContextMenu" values={{ appName: displayName }} />
        </span>
      </React.Fragment>
    );

    return (
      <Dropdown
        onToggle={onToggle}
        open={open}
      >
        <NavButton
          className={css.currentAppGroupSegment}
          hideIcon
          label={navButtonLabel}
          data-role="toggle"
        />
        <DropdownMenu
          id="App_context_dropdown_menu"
          data-role="menu"
          onToggle={onToggle}
        >
          <span className={css.displayNone}>no content provided</span>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default withAppCtxMenu(AppContextDropdown);
