import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Headline, DropdownMenu, Icon, Button } from '@folio/stripes-components';
import AppIcon from '../../AppIcon';
import { withAppCtxMenu } from './AppCtxMenuContext';

class AppContextDropdown extends React.Component {
  static propTypes = {
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    selectedApp: PropTypes.object,
  }

  render() {
    const {
      onToggle,
      open,
      selectedApp,
    } = this.props;

    const toggle = (
      <Button buttonStyle="noStyle" marginBottom0 style={{ height: '40px' }} data-role="toggle">
        <Icon icon={open ? 'caret-up' : 'caret-down'} iconPosition="end">
          <AppIcon app={selectedApp.displayName.toLowerCase()}>
            <Headline tag="h1" size="small" margin="none">
              {selectedApp.displayName}
              <span className="sr-only">
                <FormattedMessage id="stripes-core.mainnav.appContextMenu" />
              </span>
            </Headline>
          </AppIcon>
        </Icon>
      </Button>
    );

    return (
      <Dropdown
        onToggle={onToggle}
        open={open}
      >
        { toggle }
        <DropdownMenu
          id="App_context_dropdown_menu"
          data-role="menu"
          onToggle={onToggle}
        >
          {/* `currently, dropdowns need something initially rendered
          in order for the element to render/be used
          as a Portal target later` */}
          <span hidden>no content provided</span>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default withAppCtxMenu(AppContextDropdown);
