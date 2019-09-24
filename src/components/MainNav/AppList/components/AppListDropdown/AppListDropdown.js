/**
 * App List -> Dropdown
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import NavListItem from '@folio/stripes-components/lib/NavListItem';
import NavListItemStyles from '@folio/stripes-components/lib/NavListItem/NavListItem.css';

import AppIcon from '../../../../AppIcon';
import css from '../../AppList.css';

const AppListDropdown = ({ toggleDropdown, apps, listRef }) => (
  <div className={css.dropdownBody}>
    <ul
      ref={listRef}
      className={css.dropdownList}
      role="menu"
    >
      {
        apps.map((app, index) => {
          const isOddRow = !(index % 2);

          return (
            <li
              role="none"
              key={app.id}
            >
              <NavListItem
                key={index}
                onClick={toggleDropdown}
                to={app.href}
                isActive={app.active}
                className={classnames(css.dropdownListItem, { [NavListItemStyles.odd]: isOddRow })}
                aria-label={app.displayName}
                id={`app-list-item-${app.id}`}
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
  toggleDropdown: PropTypes.func.isRequired,
};

export default AppListDropdown;
