import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import Layout from '@folio/stripes-components/lib/Layout';
import classNames from 'classnames'; // eslint-disable-line
import { Transition } from 'react-overlays'; // eslint-disable-line
import css from './Toast.css';

const propTypes = {
  /*
   * String to be printed on the notification
   */
  message: PropTypes.string.isRequired,
  /*
   * Screen positioning of notification: e.g "start" or "end top". Defaults to "end bottom".
   */
  position: PropTypes.string,
  /*
   * How the notification animates into the page. Possible values are "slide" and "fade". Defaults to "slide".
   */
  transition: PropTypes.string,
  /*
   * Determines the styling of the notification. Possible values are "success" and "error". Defaults to "info".
   */
  type: PropTypes.string,
  /*
   * Determines how long the Notification stays before it disappears. a value of 0 will stay until the user dismisses it
   * by clicking the "X." Defaults to 6000 (6 seconds.)
   */
  timeout: PropTypes.number,
  /*
   * Unique identifier
   */
  id: PropTypes.string.isRequired,
  /*
   * Handler for hiding the Toast
   */
  onHide: PropTypes.func,
};

const defaultProps = {
  position: 'end bottom',
  transition: 'slide',
  timeout: 6000,
};

class ToastNotification extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: true,
    };

    this.timeout = null;

    this.handleHide = this.handleHide.bind(this);
    this.onExited = this.onExited.bind(this);
  }

  componentDidMount() {
    if (this.props.timeout !== 0) {
      this.timeout = window.setTimeout(() => { this.handleHide(); }, this.props.timeout);
    }
  }

  onExited() {
    this.props.onHide(this.props.id);
  }

  getDisplayClass() {
    const { type } = this.props;
    return classNames(
      css.base,
      { [`${css.error}`]: type === 'error' },
      { [`${css.success}`]: type === 'success' },
    );
  }

  getTransitionClass() {
    const { position, transition } = this.props;
    return classNames(
      { [`${css.startOutside}`]:
        /start\b/.test(position) && transition === 'slide' },
      { [`${css.endOutside}`]:
        /end\b/.test(position) && transition === 'slide' || // eslint-disable-line
        ((position === 'top' || position === 'bottom') && transition === 'slide') },
      { [`${css.fade}`]: transition === 'fade' },
    );
  }

  getRootClass() {
    const { position } = this.props;
    return classNames(
      css.toastNotificationRoot,
      { [`${css.alignStart}`]: /start\b/.test(position) },
    );
  }

  handleHide() {
    this.setState({ show: false });
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
  }

  render() {
    const message = typeof (this.props.message) === 'string' ? (
      <Layout className="flex full justified centerItems">
        {this.props.message}
        <Button
          buttonStyle="link"
          title="Dismiss this message"
          onClick={this.handleHide}
        >
          <Icon icon="closeX" />
        </Button>
      </Layout>
    ) : (
      <Layout className="flex full justified centerItems">
        {this.props.message}
        <Button
          buttonStyle="link"
          title="Dismiss this message"
          onClick={this.handleHide}
        >
          <Icon icon="closeX" />
        </Button>
      </Layout>
    );

    return (
      <div className={this.getRootClass()}>
        <Transition
          in={this.state.show}
          className={this.getTransitionClass()}
          timeout={400}
          enteredClassName={css.open}
          onExited={this.onExited}
          transitionAppear
        >
          <div className={this.getDisplayClass()} >
            {message}
          </div>
        </Transition>
      </div>
    );
  }
}

ToastNotification.propTypes = propTypes;
ToastNotification.defaultProps = defaultProps;

export default ToastNotification;
