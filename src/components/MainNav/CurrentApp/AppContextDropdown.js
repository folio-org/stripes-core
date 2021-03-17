import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown, DropdownMenu } from '@folio/stripes-components';
import CurrentAppButton from './CurrentAppButton';
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
      <CurrentAppButton
        ref={triggerRef}
        onClick={onToggle}
        iconKey={selectedApp.displayName.toLowerCase()}
        onKeyDown={keyHandler}
        open={open}
        label={
          <>
            {selectedApp.displayName}
            <span className="sr-only">
              <FormattedMessage id="stripes-core.mainnav.appContextMenu" />
            </span>
          </>
        }
        {...ariaProps}
      />
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
