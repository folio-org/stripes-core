/**
 * App List -> Dropdown
 */

import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import { NavListItem, NavListSection } from '@folio/stripes-components';

import AppIcon from '../../../../AppIcon';
import css from '../../AppList.css';

const AppListDropdown = ({ toggleDropdown, apps, listRef, selectedApp }) => (
  <NavListSection
    role="menu"
    className={css.dropdownBody}
    ref={listRef}
    data-test-app-list-dropdown
    striped
  >
    {
      sortBy(apps, app => app.displayName.toLowerCase()).map(app => (
        <NavListItem
          key={app.id}
          data-test-app-list-dropdown-item
          data-test-app-list-dropdown-current-item={selectedApp && selectedApp.id === app.id}
          onClick={toggleDropdown}
          to={app.href}
          isActive={selectedApp && selectedApp.id === app.id}
          className={css.dropdownListItem}
          aria-label={app.displayName}
          id={`app-list-dropdown-item-${app.id}`}
          role="button"
        >
          <AppIcon
            app={app.module}
            size="small"
            icon={app.iconData}
          />
          <span className={css.dropdownListItemLabel}>
            {app.displayName}
          </span>
        </NavListItem>
      ))
    }
  </NavListSection>
);

AppListDropdown.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  listRef: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  selectedApp: PropTypes.shape({
    id: PropTypes.string,
  }),
  toggleDropdown: PropTypes.func.isRequired,
};

export default AppListDropdown;
