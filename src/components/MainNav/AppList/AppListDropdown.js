/**
 * App List Dropdown
 */

import React from 'react';
import PropTypes from 'prop-types';

import css from './AppList.css';
import List from './List';

const AppListDropdown = React.forwardRef(({ toggleDropdown, apps }, ref) => (
  <div ref={ref} tabIndex="-1" className={css.dropdownBody}>
    <List
      items={apps}
      onItemClick={toggleDropdown}
    />
  </div>
));

AppListDropdown.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object).isRequired,
  toggleDropdown: PropTypes.func.isRequired,
};

export default AppListDropdown;
