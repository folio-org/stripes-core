import _ from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Headline,
  List,
} from '@folio/stripes-components';
import { useStripes } from '../../StripesContext';

/**
 * AboutAPIGateway
 * Display API gateway details including version, tenant, gateway URL
 * @returns
 */
const AboutAPIGateway = () => {
  const stripes = useStripes();
  const unknownMsg = <FormattedMessage id="stripes-core.about.unknown" />;
  return (
    <>
      <Headline size="large">
        <FormattedMessage id="stripes-core.about.okapiServices" />
      </Headline>
      <Headline>
        <FormattedMessage id="stripes-core.about.foundation" />
      </Headline>
      <List
        listStyle="bullets"
        itemFormatter={(item, i) => (<li key={i}>{item}</li>)}
        items={[
          <FormattedMessage id="stripes-core.about.version" values={{ version: _.get(stripes, ['discovery', 'okapi']) || unknownMsg }} />,
          <FormattedMessage id="stripes-core.about.forTenant" values={{ tenant: _.get(stripes, ['okapi', 'tenant']) || unknownMsg }} />,
          <FormattedMessage id="stripes-core.about.onUrl" values={{ url: _.get(stripes, ['okapi', 'url']) || unknownMsg }} />
        ]}
      />
    </>
  );
};

export default AboutAPIGateway;
