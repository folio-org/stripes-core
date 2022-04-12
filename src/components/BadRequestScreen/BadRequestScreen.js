import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Headline from '@folio/stripes-components/lib/Headline';

import AddContext from '../../AddContext';
import Pluggable from '../../Pluggable';
import { useStripes } from '../../StripesContext';

import css from './BadRequestScreen.css';

const BadRequestScreen = ({ isResetPasswordRoute }) => {
  const stripes = useStripes();

  const errorMessage = isResetPasswordRoute
    ? <FormattedMessage id="stripes-core.front.error.setPassword.message" />
    : (
      <FormattedMessage
        id="stripes-core.front.error.general.message"
        values={{
          url: window.location.href,
          br: <br />,
        }}
      />
    );

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
            {errorMessage}
          </Headline>
        </div>
      </Pluggable>
    </AddContext>
  );
};

BadRequestScreen.propTypes = {
  isResetPasswordRoute: PropTypes.bool.isRequired,
};

export default BadRequestScreen;
