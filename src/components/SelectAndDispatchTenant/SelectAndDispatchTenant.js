import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Row,
  Select,
} from '@folio/stripes-components';

import { useStripes } from '../../StripesContext';
import { setOkapiTenant } from '../../okapiActions';
import entitlementService from '../../entitlementService';
import FieldLabel from '../CreateResetPassword/components/FieldLabel';

/**
 * When stripes.config.js::config.tenantOptions contains multiple entries,
 * return a Select field listing all available tenants with an onchange handler
 * that dispatches setOkapiTenant().
 *
 * When stripes.config.js::config.tenantOptions is undefined or contains a
 * single entry, return null.
 *
 * @returns Component for member-tenant authn, null for central-tenant authn
 */
const SelectAndDispatchTenant = ({ styles }) => {
  const stripes = useStripes();
  const { config: { tenantOptions: fallbackTenantOptions = {} } } = stripes;
  const [tenantOptions, setTenantOptions] = useState(fallbackTenantOptions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTenantOptions = async () => {
      try {
        const asyncTenantOptions = await entitlementService.getTenantOptions();
        // Use async tenant options if available, otherwise fall back to the ones from useStripes
        setTenantOptions(Object.keys(asyncTenantOptions).length > 0 ? asyncTenantOptions : fallbackTenantOptions);
      } catch (error) {
        console.warn('Failed to load tenant options from entitlementService, using fallback:', error);
        setTenantOptions(fallbackTenantOptions);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantOptions();
  }, [fallbackTenantOptions]);

  const options = Object.values(tenantOptions).map(i => ({ value: i.name, label: i.displayName ?? i.name }));

  const handleSelectTenant = (tenant) => {
    stripes.store.dispatch(setOkapiTenant({ tenant }));
  };

  if (!isLoading && tenantOptions) {
    if (Object.keys(tenantOptions).length > 1) {
      return (
        <div data-test-new-username-field>
          <Row center="xs">
            <Col xs={6}>
              <Row
                between="xs"
                bottom="xs"
              >
                <Col xs={6}>
                  <FieldLabel htmlFor="select-tenant">
                    <FormattedMessage id="stripes-core.tenantChoose" />
                  </FieldLabel>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={6}>
              <Select
                id="select-tenant"
                defaultValue=""
                onChange={(e) => handleSelectTenant(e.target.value)}
                disabled={isLoading}
                dataOptions={[...options, { value: '', label: '' }]}
                selectClass={styles?.loginInput}
              />
            </Col>
          </Row>
        </div>
      );
    }
  }

  return null;
};

SelectAndDispatchTenant.propTypes = {
  styles: PropTypes.shape({
    loginInput: PropTypes.string,
  }),
};

export default SelectAndDispatchTenant;
