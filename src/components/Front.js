import React from 'react';
import Link from 'react-router-dom/Link';
import { FormattedMessage } from 'react-intl';

export const Front = () => (
  <div>
    <h3>
      <FormattedMessage id="stripes-core.front.welcome" />
    </h3>
    <p>
      <Link to="/about">
        <FormattedMessage id="stripes-core.front.about" />
      </Link>
    </p>
  </div>
);
export default Front;
