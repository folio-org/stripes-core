import React from 'react';
import PropTypes from 'prop-types';
import Headline from '@folio/stripes-components/lib/Headline';
import { FormattedMessage } from 'react-intl';

// TODO: release version of @folio/stripes-components has a broken index.js
// TODO: so just reach in and grab it from lib.
// TODO: see https://github.com/folio-org/stripes-components/pull/39
// import { Pluggable } from '@folio/stripes-components';
import Pluggable from '@folio/stripes-components/lib/Pluggable';

import css from './Front.css';

const Front = () => (
  <Pluggable type="frontpage">
    <div className={css.frontWrap}>
      <Headline faded tag="h1" margin="none" className={css.frontTitle}><FormattedMessage id="stripes-core.front.welcome" /></Headline>
    </div>
  </Pluggable>
);

export default Front;
