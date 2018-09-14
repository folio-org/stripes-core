/**
 * App List -> List
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import Link from 'react-router-dom/Link';

import AppIcon from '@folio/stripes-components/lib/AppIcon';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import NavListItem from '@folio/stripes-components/lib/NavListItem';
import NavListItemStyles from '@folio/stripes-components/lib/NavListItem/NavListItem.css';

import css from './AppList.css';

class List extends Component {
  static propTypes = {
    onItemClick: PropTypes.func,
    items: PropTypes.arrayOf(PropTypes.object),
  }

  renderNavItems() {
    const { items, onItemClick } = this.props;

    const getItemStyle = (isDragging, draggableStyle) => ({
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
    
      // change background colour if dragging
      // background: isDragging ? 'lightgreen' : 'grey',
    
      // styles we need to apply on draggables
      ...draggableStyle,
    });

    return items.map((app, index) => {
      const isOdd = index % 2;

      return (
        <Draggable key={app.id} draggableId={app.id} index={index}>
          {(provided, snapshot) => {
            console.log('provided', provided);
            console.log('snapshot', snapshot);
            return (
              <NavListItem
                onClick={onItemClick}
                key={index}
                to={app.href}
                className={classNames(css.dropdownListItem, { [NavListItemStyles['NavListItem--odd']]: isOdd })}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
              >
                <AppIcon app={app.name} size="small" icon={app.iconData} />
                <span className={css.dropdownListItemLabel}>{ app.displayName }</span>
                { app.description && <span className={css.dropdownListItemDescription}>{ app.description }</span>}
              </NavListItem>
            );
          }}
        </Draggable>
      );
    });
  }

  render() {
    return (
      <NavList className={css.dropdownList}>
        <NavListSection>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                ref={provided.innerRef}
              >
                { this.renderNavItems() }
              </div>
            )}
          </Droppable>
        </NavListSection>
      </NavList>
    );
  }
}

export default List;
