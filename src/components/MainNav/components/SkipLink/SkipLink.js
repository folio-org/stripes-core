/**
 * SkipLink
 *
 * Hidden until focused and sends the user to the main content when clicked
 */

import React from 'react';
import { useIntl } from 'react-intl';
import NavButton from '../../NavButton';
import css from './SkipLink.css';

const SkipIcon = () => (
  <svg className={css.skipLink__icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
    <polygon points="13 16.5 1.2 5.3 3.2 3.1 13 12.4 22.8 3.1 24.8 5.3 " />
    <polygon points="13 24.8 1.2 13.5 3.2 11.3 13 20.6 22.8 11.3 24.8 13.5 " />
  </svg>
);

const SkipLink = () => {
  const intl = useIntl();

  return (
    <NavButton
      icon={<SkipIcon />}
      href="#ModuleContainer"
      aria-label={intl.formatMessage({ id: 'stripes-core.mainnav.skipMainNavigation' })}
      className={css.skipLink}
    />
  );
};

export default SkipLink;
