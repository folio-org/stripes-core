import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { List } from '@folio/stripes-components';

import stripesConnect from '../../stripesConnect';

class AboutEnabledModules extends React.Component {
  static manifest = Object.freeze({
    enabledModules: {
      type: 'okapi',
      path: '_/proxy/tenants/!{tenantid}/modules',
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      enabledModules: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
      }),
    }),
    // prop-types cannot be calculated because the keys are set at runtime.
    // keys are module-names, values are human-readable strings.
    availableModules: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tenantid: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  };

  render() {
    const em = {};
    _.each(this.props.resources.enabledModules?.records || [], (m) => { em[m.id] = true; });
    const items = Object.keys(this.props.availableModules).sort((a, b) => a.localeCompare(b));
    const itemFormatter = (key) => {
      let style = {};
      if (!em[key]) {
        style = { color: '#ccc' };
      }

      return (
        <li key={key} style={style}>
          {this.props.availableModules[key]}
          {' '}
          <tt>{`(${key})`}</tt>
        </li>
      );
    };

    return (
      <List
        listStyle="bullets"
        items={items}
        itemFormatter={itemFormatter}
      />
    );
  }
}

export default stripesConnect(AboutEnabledModules);
