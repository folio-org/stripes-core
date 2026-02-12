import { useStripes } from '../../StripesContext';

import {
  Row,
  Col,
  Headline,
} from '@folio/stripes-components';

import OrganizationLogo from '../OrganizationLogo';
import styles from './AppConfigError.css';

/**
 * AppConfigError
 * Show an error message. This component is rendered by App, before anything
 * else, when it detects that local storage, session storage, or cookies are
 * unavailable. This happens _before_ Root has been initialized, i.e. before
 * an IntlProvider is available, hence the hard-coded, English-only message.
 *
 * @returns English-only error message
 */
const AppConfigError = () => {
  const { branding } = useStripes();
  return (
    <main>
      <div className={styles.wrapper} style={branding?.style?.login ?? {}}>
        <div className={styles.container}>
          <Row center="xs">
            <Col xs={6}>
              <OrganizationLogo />
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={6}>
              <Headline
                size="xx-large"
                tag="h1"
              >
                FOLIO requires cookies, sessionStorage, and localStorage. Please enable these features and try again.
              </Headline>
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
};

export default AppConfigError;
