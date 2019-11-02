/**
 * App List -> Dropdown
 */

import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import classnames from 'classnames';

import NavListItem from '@folio/stripes-components/lib/NavListItem';
import NavListItemStyles from '@folio/stripes-components/lib/NavListItem/NavListItem.css';

import AppIcon from '../../../../AppIcon';
import css from '../../AppList.css';

const AppListDropdown = ({ toggleDropdown, apps, listRef, selectedApp }) => (
  <div className={css.dropdownBody} data-test-app-list-dropdown>
    <ul
      ref={listRef}
      className={css.dropdownList}
      role="menu"
    >
      {
        sortBy(apps, app => app.displayName.toLowerCase()).map((app, index) => {
          const isOddRow = !(index % 2);

          return (
            <li
              role="none"
              key={app.id}
            >
              <NavListItem
                data-test-app-list-dropdown-item
                data-test-app-list-dropdown-current-item={selectedApp && selectedApp.id === app.id}
                key={index}
                onClick={toggleDropdown}
                to={app.href}
                isActive={selectedApp && selectedApp.id === app.id}
                className={classnames(css.dropdownListItem, { [NavListItemStyles.odd]: isOddRow })}
                aria-label={app.displayName}
                id={`app-list-dropdown-item-${app.id}`}
                role="menuitem"
              >
                <AppIcon
                  app={app.name}
                  size="small"
                  icon={app.iconData}
                />
                <span className={css.dropdownListItemLabel}>
                  {app.displayName}
                </span>
              </NavListItem>
            </li>
          );
        })
      }
    </ul>
  </div>
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
