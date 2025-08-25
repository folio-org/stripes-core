import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import stripesConnect from '@folio/stripes-connect/package';
import stripesComponents from '@folio/stripes-components/package';
import stripesLogger from '@folio/stripes-logger/package';

import {
  Headline,
  List,
} from '@folio/stripes-components';
import stripesCore from '../../../package';
import { useStripes } from '../../StripesContext';


const AboutStripes = () => {
  const stripes = useStripes();
  const unknownMsg = <FormattedMessage id="stripes-core.about.unknown" />;
  const stripesModules = [
    {
      key: 'stripes-core',
      value: `stripes-core ${stripesCore.version}`,
    },
    {
      key: 'stripes-connect',
      value: `stripes-connect ${stripesConnect.version}`,
    },
    {
      key: 'stripes-components',
      value: `stripes-components ${stripesComponents.version}`,
    },
    {
      key: 'stripes-logger',
      value: `stripes-logger ${stripesLogger.version}`,
    },
  ];

  return (
    <>
      <Headline size="large">
        <FormattedMessage id="stripes-core.about.userInterface" />
      </Headline>
      <Headline>
        <FormattedMessage id="stripes-core.about.foundation" />
      </Headline>
      <span
        id="platform-versions"
        data-stripes-core={stripesCore.version}
        data-stripes-connect={stripesConnect.version}
        data-stripes-components={stripesComponents.version}
        data-okapi-version={_.get(stripes, ['discovery', 'okapi']) || unknownMsg}
        data-okapi-url={_.get(stripes, ['okapi', 'url']) || unknownMsg}
      />
      <List
        listStyle="bullets"
        items={stripesModules}
        itemFormatter={item => (<li key={item.key}>{item.value}</li>)}
      />
    </>
  );
};

export default AboutStripes;
