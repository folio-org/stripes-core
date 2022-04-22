/**
 * CurrentAppButton
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Headline } from '@folio/stripes-components';
import NavButton from '../NavButton';
import css from './CurrentApp.css';

const CurrentAppButton = forwardRef(({
  ariaLabel,
  badge,
  iconData,
  iconKey,
  id,
  label,
  open,
  to,
  ...rest
}, ref) => (
  <NavButton
    ref={ref}
    open={open}
    label={
      <Headline
        tag="h1"
        margin="none"
        weight="black"
        className={css.button__label__inner}
      >
        {label}
      </Headline>
    }
    id={id}
    ariaLabel={ariaLabel}
    badge={badge}
    iconKey={iconKey}
    className={css.button}
    innerClassName={css.button__inner}
    labelClassName={css.button__label}
    to={to}
    iconData={iconData}
    {...rest}
  />
));

CurrentAppButton.propTypes = {
  ariaLabel: PropTypes.string,
  badge: PropTypes.string,
  iconData: PropTypes.object,
  iconKey: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.node,
  open: PropTypes.bool,
  to: PropTypes.string,
};

export default CurrentAppButton;
