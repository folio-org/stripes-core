import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Button,
  Col,
  Headline,
  Row,
} from '@folio/stripes-components';

import OrganizationLogo from './OrganizationLogo';

export const parseError = (error) => {
  // do we have JSON from an error API response?
  if (error?.errors?.[0]?.message) {
    return error.errors[0].message;
  }

  // if not, do we have an Error object?
  if (typeof error?.message === 'string') {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return undefined;
};

const OIDCLandingError = ({ error }) => {
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
          <Headline>{parseError(error)}</Headline>
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

OIDCLandingError.propTypes = {
  error: PropTypes.oneOfType([
    // API error response
    PropTypes.shape({
      errors: PropTypes.arrayOf(PropTypes.shape({
        message: PropTypes.string
      }))
    }),
    // some kinda Error object
    PropTypes.shape({
      message: PropTypes.string
    }),
    // boring ol' string
    PropTypes.string,
  ])
};
export default OIDCLandingError;

