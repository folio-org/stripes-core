/**
 * App List Dropdown
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchField from '@folio/stripes-components/lib/SearchField';

import css from './AppList.css';
import List from './List';

const propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  searchfieldId: PropTypes.string.isRequired,
  dropdownToggleId: PropTypes.string.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
};

class AppListDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
    };

    this.getListItems = this.getListItems.bind(this);
  }

  getListItems() {
    const { apps } = this.props;
    const { query } = this.state;
    let items = apps;

    // If we are filtering by searching
    if (query) {
      items = apps.filter(app => app.displayName.toLowerCase().indexOf(query.toLowerCase()) >= 0);
    }

    return items;
  }

  render() {
    const { searchfieldId, toggleDropdown } = this.props;

    return (
      <div className={css.dropdownBody}>
        <header className={css.dropdownHeader}>
          <SearchField
            value={this.state.query}
            onChange={e => this.setState({ query: e.target.value })}
            onClear={() => this.setState({ query: '' })}
            id={searchfieldId}
            marginBottom0
            autoFocus
          />
        </header>
        <List
          items={this.getListItems()}
          onItemClick={toggleDropdown}
        />
      </div>
    );
  }
}

AppListDropdown.propTypes = propTypes;

export default AppListDropdown;
