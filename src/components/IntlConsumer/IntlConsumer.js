import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

const IntlConsumer = ({ intl, children }) => (
  children(intl)
);

IntlConsumer.propTypes = {
  children: PropTypes.func,
  intl: intlShape,
};

export default injectIntl(IntlConsumer);
