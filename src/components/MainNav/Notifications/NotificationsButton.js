import React from 'react';
import PropTypes from 'prop-types';
import NavButton from '../NavButton';

const NotificationsButton = (props) => {
  const { notificationCount, ...inputProps } = props;
  const notifications = (notificationCount && notificationCount > 0) ? ((notificationCount > 9) ? '9+' : notificationCount) : null;
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.083 13.381v-2.417a8.095 8.095 0 0 0-5.407-7.621C14.532 1.994 13.386.94 12 .94S9.468 1.994 9.324 3.343a8.095 8.095 0 0 0-5.407 7.621v2.417a6.58 6.58 0 0 1-2.245 4.941.751.751 0 0 0 .495 1.313h5.909A4.001 4.001 0 0 0 12 22.88a4 4 0 0 0 3.924-3.245h5.909a.75.75 0 0 0 .495-1.313 6.579 6.579 0 0 1-2.245-4.941zm-4.838 4.755a.75.75 0 0 0-.75.75A2.498 2.498 0 0 1 12 21.381a2.498 2.498 0 0 1-2.495-2.495.75.75 0 0 0-.75-.75H3.862a8.068 8.068 0 0 0 1.555-4.755v-2.417c0-2.963 2-5.574 4.864-6.348.365-.099.594-.497.541-.872-.005-.037-.013-.074-.013-.113a1.192 1.192 0 0 1 2.382 0c0 .039-.008.076-.02.16a.751.751 0 0 0 .547.826 6.59 6.59 0 0 1 4.864 6.348v2.417c0 1.721.553 3.383 1.555 4.755h-4.892z" /></svg>
  );

  return (
    <NavButton {...inputProps} icon={icon} badge={notifications} noSelectedBar />
  );
};

NotificationsButton.propTypes = {
  notificationCount: PropTypes.number,
};

export default NotificationsButton;
