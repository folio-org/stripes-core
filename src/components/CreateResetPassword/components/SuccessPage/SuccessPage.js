import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Button,
  Headline,
} from '@folio/stripes-components';

import OrganizationLogo from '../../../OrganizationLogo';

import styles from './SuccessPage.css';

const SuccessPage = ({ handleClick }) => {
  const labelNamespace = 'stripes-core.label';
  const buttonNamespace = 'stripes-core.button';

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
        <Button
          buttonClass={styles.submitButton}
          buttonStyle="primary"
          fullWidth
          marginBottom0
          onClick={handleClick}
        >
          <FormattedMessage id={`${buttonNamespace}.redirect.login`} />
        </Button>
      </div>
    </div>
  );
};

SuccessPage.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default SuccessPage;
