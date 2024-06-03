import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Headline } from '@folio/stripes-components';

import Pluggable from '../../Pluggable';

import css from './ResetPasswordNotAvailableScreen.css';

const ResetPasswordNotAvailableScreen = () => {
  return (
    <Pluggable type="frontpage">
      <div className={css.titleWrap}>
        <Headline
          faded
          tag="h1"
          margin="none"
          className={css.title}
        >
          <FormattedMessage id="stripes-core.front.error.header" />
        </Headline>
        <Headline
          faded
          tag="h3"
          margin="none"
          className={css.title}
        >
          <FormattedMessage id="stripes-core.front.error.setPassword.message" />
        </Headline>
      </div>
    </Pluggable>
  );
};

export default ResetPasswordNotAvailableScreen;
