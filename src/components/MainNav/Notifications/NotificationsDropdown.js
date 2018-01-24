import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import NotificationsButton from './NotificationsButton';
import NotificationsMenu from './NotificationsMenu';

class NotificationsDropdown extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      lastOpen: null,
    };

    this.handleToggle = this.handleToggle.bind(this);
    this.connectedNotificationsMenu = props.stripes.connect(NotificationsMenu);
  }

  handleToggle() {
    const newState = {};
    newState.dropdownOpen = !this.state.dropdownOpen;

    if (!newState.dropdownOpen) {
      newState.lastOpen = moment();
    }

    this.setState(newState);
  }

  render() {
    return (
      <Dropdown onToggle={this.handleToggle} open={this.state.dropdownOpen}>
        <NotificationsButton data-role="toggle" title="Notifications" notificationCount={0} selected={this.state.dropdownOpen} />
        <DropdownMenu data-role="menu" onToggle={this.handleToggle}>
          <this.connectedNotificationsMenu
            lastOpen={this.state.lastOpen}
            {...this.props}
          />
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default NotificationsDropdown;
