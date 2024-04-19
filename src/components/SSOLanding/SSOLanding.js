import { Redirect } from 'react-router';

import {
  Loading,
} from '@folio/stripes-components';

import useSSOSession from './useSSOSession';
import styles from './SSOLanding.css';

const SSOLanding = () => {
  const { isSessionFailed } = useSSOSession();

  if (isSessionFailed) {
    return <Redirect to="/" />;
  }

  return (
    <main
      data-test-sso-success
      className={styles.ssoLoading}
    >
      <Loading size="xlarge" />
    </main>
  );
};

export default SSOLanding;
