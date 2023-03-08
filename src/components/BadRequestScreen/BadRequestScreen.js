import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Headline } from '@folio/stripes-components';

import AddContext from '../../AddContext';
import Pluggable from '../../Pluggable';
import { useStripes } from '../../StripesContext';

import css from './BadRequestScreen.css';

const BadRequestScreen = () => {
  const stripes = useStripes();

  return (
    <AddContext context={{ stripes }}>
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
            <FormattedMessage
              id="stripes-core.front.error.general.message"
              values={{
                url: window.location.href,
                br: <br />,
              }}
            />
          </Headline>
        </div>
      </Pluggable>
    </AddContext>
  );
};

export default BadRequestScreen;
