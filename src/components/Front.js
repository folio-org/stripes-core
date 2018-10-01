import React from 'react';
import PropTypes from 'prop-types';
import Headline from '@folio/stripes-components/lib/Headline';
import { FormattedMessage } from 'react-intl';

import Pluggable from '../Pluggable';

import css from './Front.css';
import AddContext from '../AddContext';

const Front = ({ stripes }) => (
  <AddContext context={{ stripes }}>
    <Pluggable type="frontpage">
      <div className={css.frontWrap}>
        <Headline faded tag="h1" margin="none" className={css.frontTitle}><FormattedMessage id="stripes-core.front.welcome" /></Headline>
      </div>
    </Pluggable>
  </AddContext>
);

Front.propTypes = {
  stripes: PropTypes.object.isRequired,
};

export default Front;
