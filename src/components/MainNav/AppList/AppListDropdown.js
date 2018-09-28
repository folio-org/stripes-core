/**
 * App List -> Dropdown
 */

import React from 'react';
import PropTypes from 'prop-types';

import css from './AppList.css';
import List from './List';

const AppListDropdown = ({ toggleDropdown, apps, listRef }) => (
  <div className={css.dropdownBody}>
    <List
      ref={listRef}
      apps={apps}
      onItemClick={toggleDropdown}
    />
  </div>
);

AppListDropdown.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  listRef: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  toggleDropdown: PropTypes.func.isRequired,
};

export default AppListDropdown;
