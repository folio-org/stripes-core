import React from 'react';
import { FormattedMessage } from 'react-intl';

import Headline from '@folio/stripes-components/lib/Headline';

import OrganizationLogo from '../../../OrganizationLogo';

import styles from './SuccessPage.css';

const SuccessPage = () => {
  const labelNamespace = 'stripes-core.label';
  // Todo: UIU-748, implement routing button to login page
  return (
    <div className={styles.wrap}>
      <div className={styles.centered}>
        <OrganizationLogo />
        <Headline
          size="xx-large"
          tag="h1"
        >
          <FormattedMessage id={`${labelNamespace}.congratulations`} />
        </Headline>
        <Headline
          size="x-large"
          tag="p"
          bold={false}
          faded
        >
          <FormattedMessage id={`${labelNamespace}.changed.password`} />
        </Headline>
      </div>
    </div>
  );
};

export default SuccessPage;
