import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';

import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import List from '@folio/stripes-components/lib/List';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import css from '@folio/stripes-components/lib/DropdownMenu/DropdownLayout.css';
import menuStyles from './NotificationMenu.css';

class NotificationsMenu extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      locale: PropTypes.string.isRequired,
    }).isRequired,
    lastOpen: PropTypes.object,
    dateFormat: PropTypes.string,
    resources: PropTypes.shape({
      notifications: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  };

  static defaultProps = {
    dateFormat: 'l LT',
  };

  static manifest = Object.freeze({
    notifications: {
      type: 'okapi',
      path: 'notify/_self',
      records: 'notifications',
    },
  });

  constructor(props) {
    super(props);

    this.state = {
      filter: null,
    };

    this.getNotificationClass = this.getNotificationClass.bind(this);
    this.notificationListFormatter = this.notificationListFormatter.bind(this);
    this.onClickFilter = this.onClickFilter.bind(this);

    moment.locale(props.stripes.locale);
  }

  getNotificationClass(date) {
    return classNames(
      menuStyles.notification,
      { [`${menuStyles.new}`]: this.props.lastOpen ? moment(this.props.lastOpen).isBefore(date) : true },
    );
  }

  onClickFilter(filter) {
    if (['users', 'requests'].indexOf(filter) !== -1) {
      this.setState({ filter });
    } else {
      this.setState({ filter: null });
    }
  }

  notificationListFormatter(notification) {
    const formattedDate = moment(notification.metadata.createdDate).format(this.props.dateFormat);

    return (
      <a key={notification.id} href={notification.url} style={{ display: 'block' }}>
        <Row className={this.getNotificationClass(notification.date)}>
          <Col xs>
            <div><strong>{notification.source} {formattedDate}</strong></div>
            <p>{notification.text}</p>
          </Col>
        </Row>
      </a>
    );
  }

  render() {
    const notifications = ((this.props.resources.notifications || {}).records || [])
      .filter((n) => {
        const [domain] = n.link.split('/');
        return (this.state.filter) ? domain === this.state.filter : true;
      });

    return (
      <div className={menuStyles.notificationMenu}>
        <div className={css.dropdownHeader}>Notifications</div>
        <div className={css.dropdownBody}>
          <div className={`${css.dropdownColumn} ${css.secondary}`} style={{ width: '30%' }}>
            <NavList>
              <NavListSection activeLink="all">
                <Button buttonStyle="link" fullWidth name="all" onClick={() => this.onClickFilter(null)}>All</Button>
                <Button buttonStyle="link" fullWidth name="users" onClick={() => this.onClickFilter('users')}>Users</Button>
                <Button buttonStyle="link" fullWidth name="requests" onClick={() => this.onClickFilter('requests')}>Requests</Button>
              </NavListSection>
            </NavList>
          </div>
          <div className={`${css.dropdownColumn} ${css.fill}`}>
            <List items={notifications} itemFormatter={this.notificationListFormatter} />
          </div>
        </div>
      </div>
    );
  }
}

export default NotificationsMenu;
