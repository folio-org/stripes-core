import { FormattedMessage } from 'react-intl';

import {
  Col,
  Row,
  Select,
} from '@folio/stripes-components';

import { useStripes } from '../../StripesContext';
import { setOkapiTenant } from '../../okapiActions';
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
  const { config: { tenantOptions = {} } } = stripes;

  const options = Object.values(tenantOptions).map(i => ({ value: i.name, label: i.displayName ?? i.name }));

  const handleSelectTenant = (tenant) => {
    stripes.store.dispatch(setOkapiTenant({ tenant }));
  };

  if (tenantOptions) {
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

export default SelectAndDispatchTenant;
