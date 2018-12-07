import React from 'react';
import { FormattedMessage } from 'react-intl';

import Headline from '@folio/stripes-components/lib/Headline';

import OrganizationLogo from '../../../OrganizationLogo';

import styles from './ChangePasswordConfirmation.css';

const ChangePasswordConfirmation = () => {
  const labelNamespace = 'stripes-core.label';
  // Todo: UIU-748, implement routing button to login page
  return (
    <div
      className={styles.wrap}
      data-test-change-password-confirmation
    >
      <div className={styles.centered}>
        <OrganizationLogo />
        <Headline
          size="xx-large"
          tag="h1"
          data-test-h1
        >
          <FormattedMessage id={`${labelNamespace}.congratulations`} />
        </Headline>
        <Headline
          size="x-large"
          tag="p"
          bold={false}
          faded
          data-test-message
        >
          <FormattedMessage id={`${labelNamespace}.changed.password`} />
        </Headline>
      </div>
    </div>
  );
};

export default ChangePasswordConfirmation;
