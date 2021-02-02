import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Headline, DropdownMenu, Icon, Button } from '@folio/stripes-components';
import AppIcon from '../../AppIcon';
import css from '../NavButton/NavButton.css';
import { withAppCtxMenu } from './AppCtxMenuContext';

class AppContextDropdown extends React.Component {
  static propTypes = {
    onToggle: PropTypes.func,
    open: PropTypes.bool,
    selectedApp: PropTypes.object,
  }

  render() {
    const {
      onToggle: handleToggle,
      open,
      selectedApp,
    } = this.props;

    const renderToggle = ({ triggerRef, onToggle, ariaProps, keyHandler }) => (
      <Button
        data-test-context-menu-toggle-button
        ref={triggerRef}
        onClick={onToggle}
        buttonStyle="noStyle"
        buttonClass={css.navButton}
        marginBottom0
        style={{ height: '40px' }}
        onKeyDown={keyHandler}
        {...ariaProps}
      >
        <Icon icon={open ? 'caret-up' : 'caret-down'} iconPosition="end">
          <AppIcon app={selectedApp.displayName.toLowerCase()}>
            <Headline
              tag="h1"
              margin="none"
              weight="black"
            >
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
        onToggle={handleToggle}
        renderTrigger={renderToggle}
        open={open}
        usePortal={false}
      >
        <DropdownMenu
          id="App_context_dropdown_menu"
          onToggle={handleToggle}
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
