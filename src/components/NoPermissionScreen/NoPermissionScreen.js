import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Headline } from '@folio/stripes-components';

import Pluggable from '../../Pluggable';

import css from './NoPermissionScreen.css';

const NoPermissionScreen = () => {
  return (
    <Pluggable type="frontpage">
      <div className={css.titleWrap}>
        <Headline
          faded
          tag="h2"
          className={css.title}
        >
          <FormattedMessage id="stripes-core.front.error.noPermission" />
        </Headline>
      </div>
    </Pluggable>
  );
};

export default NoPermissionScreen;
