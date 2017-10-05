import React from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-overlays'; // eslint-disable-line
import ToastNotification from './ToastNotification';
import css from './Toast.css';

const propTypes = {
  /*
   * Array of message objects with properties {message, type, timeout, id, position, transition}
   * message and id are required.
   */
  notifications: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  /*
   * Hide handler for dismissing toasts.
   */
  onHide: PropTypes.func,
};

class Toast extends React.Component {
  constructor(props) {
    super(props);
    this.toastbody = null;
    this.toastRoot = null;
  }

  render() {
    const bottomMessages = [];
    const topMessages = [];
    this.props.notifications.forEach((toast) => {
      const { id, ...toastProps } = toast;
      if (!toast.position || !/top\b/.test(toast.position)) {
        bottomMessages.unshift(
          <ToastNotification key={id} {...toastProps} onHide={this.props.onHide} id={id} />,
        );
      } else {
        topMessages.unshift(
          <ToastNotification key={id} {...toastProps} onHide={this.props.onHide} id={id} />,
        );
      }
    });

    return (
      <Portal container={document.body}>
        <div>
          <div className={`${css.toastContainerRoot} ${css.top}`}>
            {topMessages}
          </div>
          <div className={css.toastContainerRoot} >
            {bottomMessages}
          </div>
        </div>
      </Portal>
    );
  }
}

Toast.propTypes = propTypes;

export default Toast;
