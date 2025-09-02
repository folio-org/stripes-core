import { FormattedMessage } from 'react-intl';

import {
  Button,
  Col,
  Headline,
  Row,
} from '@folio/stripes-components';

import OrganizationLogo from './OrganizationLogo';

const OIDCLandingError = ({ error }) => {
  const message = error?.errors?.[0]?.message || <pre>{JSON.stringify(error, null, 2)}</pre>;

  return (
    <main data-test-saml-error>
      <Row center="xs">
        <Col xs={12}>
          <OrganizationLogo />
        </Col>
      </Row>
      <Row center="xs">
        <Col xs={12}>
          <Headline size="large"><FormattedMessage id="stripes-core.errors.oidc" /></Headline>
        </Col>
      </Row>
      <Row center="xs">
        <Col xs={12}>
          <Headline>{message}</Headline>
        </Col>
      </Row>
      <Row center="xs">
        <Col xs={12}>
          <Button to="/"><FormattedMessage id="stripes-core.rtr.idleSession.logInAgain" /></Button>
        </Col>
      </Row>
    </main>
  );
};

export default OIDCLandingError;
