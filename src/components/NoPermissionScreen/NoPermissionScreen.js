import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Headline } from '@folio/stripes-components';

import AddContext from '../../AddContext';
import Pluggable from '../../Pluggable';
import { useStripes } from '../../StripesContext';

import css from './NoPermissionScreen.css';

const NoPermissionScreen = () => {
  const stripes = useStripes();

  return (
    <AddContext context={{ stripes }}>
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
    </AddContext>
  );
};

export default NoPermissionScreen;
