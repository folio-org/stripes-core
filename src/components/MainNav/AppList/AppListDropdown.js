/**
 * App List Dropdown
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppIcon from '@folio/stripes-components/lib/AppIcon';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import SearchField from '@folio/stripes-components/lib/structures/SearchField';
import Link from 'react-router-dom/Link';
import css from './AppList.css';

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
  }

  /**
   * Focus search field on mount
   */
  componentDidMount() {
    document.getElementById(this.props.searchfieldId).focus();
  }

  render() {
    const { apps, searchfieldId, toggleDropdown, dropdownToggleId } = this.props;
    const { query } = this.state;
    let list = apps;
    let activeLink = null;

    // If we are filtering by searching
    if (query) {
      list = apps.filter(app => app.displayName.toLowerCase().indexOf(query.toLowerCase()) >= 0);
    }

    const items = list.map((app, index) => {
      if (app.active) {
        activeLink = app.href;
      }

      return (
        <Link
          onClick={toggleDropdown}
          key={index}
          to={app.href}
          className={css.dropdownListItem}
        >
          <AppIcon app={app.name} size="small" icon={app.iconData} />
          <span className={css.dropdownListItemLabel}>{ app.displayName }</span>
          { app.description && <span className={css.dropdownListItemDescription}>{ app.description }</span>}
        </Link>
      );
    });


    // If we have any items in the list (filtered by search or not)
    // we want to continue to the first app in the list
    // when a user presses enter in the search field

    // TO-DO: This needs to be activated once the user
    // can use arrow keys to scroll through the list

    // let onSearchEnter = null;
    // const firstItem = list.length && list[0];
    // if (firstItem && activeLink !== firstItem.href) {
    //   onSearchEnter = (e) => {
    //     if (e.key === 'Enter') {
    //       this.context.router.history.push(firstItem.href);
    //       this.toggleDropdown();
    //     }
    //   };
    // }

    return (
      <div className={css.dropdownBody}>
        <header className={css.dropdownHeader}>
          <input className={css.focusTrap} onFocus={() => document.getElementById(dropdownToggleId).focus()} />
          <SearchField
            value={this.state.query}
            onChange={e => this.setState({ query: e.target.value })}
            onClear={() => this.setState({ query: '' })}
            id={searchfieldId}
            marginBottom0
          />
        </header>
        <NavList className={css.dropdownList}>
          { (query && !list.length) && <div>No apps with the name &quot;{query}&quot; was found.</div> }
          <NavListSection stripped activeLink={activeLink}>
            {items}
          </NavListSection>
        </NavList>
        <input className={css.focusTrap} onFocus={() => document.getElementById(searchfieldId).focus()} />
      </div>
    );
  }
}

AppListDropdown.propTypes = propTypes;

export default AppListDropdown;
