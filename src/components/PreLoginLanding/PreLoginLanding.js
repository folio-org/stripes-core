import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { Button, Select, Col, Row } from '@folio/stripes-components';
import OrganizationLogo from '../OrganizationLogo';
import { useStripes } from '../../StripesContext';
import { getOIDCRedirectUri } from '../../loginServices';
import styles from './index.css';

function PreLoginLanding({ onSelectTenant }) {
  const intl = useIntl();
  const { okapi, config: { tenantOptions = {} } } = useStripes();

  const redirectUri = getOIDCRedirectUri(okapi.tenant, okapi.clientId);
  const options = Object.values(tenantOptions).map(i => ({ value: i.name, label: i.displayName ?? i.name }));

  const getLoginUrl = () => {
    if (!okapi.tenant) return '';
    if (okapi.authnUrl) {
      return `${okapi.authnUrl}/realms/${okapi.tenant}/protocol/openid-connect/auth?client_id=${okapi.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid&isConsortium=true`;
    }
    return '';
  };

  const submitButtonRef = useRef({ disabled: true });

  const handleChangeTenant = (e) => {
    const tenantName = e.target.value;
    submitButtonRef.current.disabled = !tenantName;
    if (tenantName === '') {
      onSelectTenant('', '');
      return;
    }
    const clientId = tenantOptions[tenantName].clientId;
    onSelectTenant(tenantName, clientId);
  };

  return (
    <main style={{ width:'100%' }}>
      <div>
        <div className={styles.container}>
          <Row center="xs">
            <Col xs={6}>
              <OrganizationLogo />
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={3}>
              <Select
                label={intl.formatMessage({ id: 'stripes-core.tenantLibrary' })}
                defaultValue=""
                onChange={handleChangeTenant}
                dataOptions={[...options, { value: '', label:intl.formatMessage({ id:'stripes-core.tenantChoose' }) }]}
              />
              <Button
                buttonClass={styles.submitButton}
                disabled={submitButtonRef.current.disabled}
                ref={submitButtonRef}
                onClick={() => window.location.assign(getLoginUrl())}
                buttonStyle="primary"
                fullWidth
              >
                {intl.formatMessage({ id:'stripes-core.button.continue' })}
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
}

PreLoginLanding.propTypes = {
  onSelectTenant: PropTypes.func.isRequired,
};

export default PreLoginLanding;
