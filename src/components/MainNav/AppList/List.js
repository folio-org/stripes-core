/**
 * App List -> List
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-beautiful-dnd';

import AppIcon from '@folio/stripes-components/lib/AppIcon';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import NavListItem from '@folio/stripes-components/lib/NavListItem';

import css from './AppList.css';

class List extends Component {
  static propTypes = {
    onItemClick: PropTypes.func,
    items: PropTypes.arrayOf(PropTypes.object),
  }

  renderNavItems() {
    const { items, onItemClick } = this.props;

    return items.map((app, index) => {
      return (
        <NavListItem
          onClick={onItemClick}
          key={index}
          to={app.href}
          className={css.dropdownListItem}
        >
          <AppIcon app={app.name} size="small" icon={app.iconData} />
          <span className={css.dropdownListItemLabel}>{ app.displayName }</span>
          { app.description && <span className={css.dropdownListItemDescription}>{ app.description }</span>}
        </NavListItem>
      );
    });
  }

  render() {
    return (
      <NavList className={css.dropdownList}>
        <NavListSection stripped>
          {this.renderNavItems()}
        </NavListSection>
      </NavList>
    );
  }
}

export default List;
