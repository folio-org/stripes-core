import React from 'react';
import moment from 'moment';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import NotificationsButton from './NotificationsButton';
import NotificationsMenu from './NotificationsMenu';

class NotificationsDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      lastOpen: null,
    }

    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle() {
    const newState = {};
    newState.dropdownOpen = !this.state.dropdownOpen;
    
    if(!newState.dropdownOpen) {
      newState.lastOpen = new moment();
    }

    this.setState(newState);
  }

  render() {
    return (
      <Dropdown onToggle={this.handleToggle} open={this.state.dropdownOpen}>
        <NotificationsButton data-role='toggle' title="Notifications" />
        <DropdownMenu data-role='menu' onToggle={this.handleToggle}>
          <NotificationsMenu  lastOpen={this.state.lastOpen}/>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default NotificationsDropdown;
/*
  <Dropdown onToggle={this.handleToggle}>
    <NotificationsButton data-role='toggle' />
    <DropdownMenu data-role='menu' onToggle={this.handleToggle}>
      <NotificationsMenu  />
    </DropdownMenu>
  </Dropdown>
*/