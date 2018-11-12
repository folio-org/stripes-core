import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';

import Headline from '@folio/stripes-components/lib/Headline';
import OrganizationLogo from '../OrganizationLogo/OrganizationLogo';

import styles from './CheckEmailStatusPage.css';

const CheckEmailStatusPage = () => (
  <Fragment>
    <div
      className={styles.wrap}
      data-test-status-page
    >
      <div className={styles.centered}>
        <OrganizationLogo />
        <Headline
          size="xx-large"
          tag="h1"
          data-test-h1
        >
          <FormattedMessage id="stripes-core.label.check.email" />
        </Headline>
        <Headline
          size="x-large"
          tag="p"
          bold={false}
          faded
          data-test-p
        >
          <FormattedMessage id="stripes-core.label.caution.email" />
        </Headline>
      </div>
    </div>
  </Fragment>
);

export default CheckEmailStatusPage;
