/**
 * App List -> Dropdown -> List
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import NavListItem from '@folio/stripes-components/lib/NavListItem';
import NavListItemStyles from '@folio/stripes-components/lib/NavListItem/NavListItem.css';

import AppIcon from '../../AppIcon';

import css from './AppList.css';

const List = React.forwardRef(({ apps, onItemClick }, ref) => {
  const renderNavItems = apps.map((app, index) => {
    const isOddRow = !(index % 2);

    return (
      <li
        role="none"
        key={app.id}
      >
        <NavListItem
          key={index}
          onClick={onItemClick}
          to={app.href}
          isActive={app.active}
          className={classNames(css.dropdownListItem, { [NavListItemStyles.odd]: isOddRow })}
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
  });

  return (
    <ul
      ref={ref}
      className={css.dropdownList}
      role="menu"
    >
      {renderNavItems}
    </ul>
  );
});

List.propTypes = {
  onItemClick: PropTypes.func,
  apps: PropTypes.arrayOf(PropTypes.object),
};

export default List;
