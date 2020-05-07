import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

const IntlConsumer = ({ intl, children }) => (
  children(intl)
);

IntlConsumer.propTypes = {
  children: PropTypes.func,
  intl: PropTypes.object,
};

export default injectIntl(IntlConsumer);
