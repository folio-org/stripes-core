import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import List from '@folio/stripes-components/lib/List';

class AboutEnabledModules extends React.Component {
  static propTypes = {
    resources: PropTypes.shape({
      enabledModules: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    availableModules: PropTypes.object,
    tenantid: PropTypes.string.isRequired, // eslint-disable-line
  };

  static manifest = Object.freeze({
    enabledModules: {
      type: 'okapi',
      path: '_/proxy/tenants/!{tenantid}/modules',
    },
  });

  render() {
    const em = {};
    _.each((this.props.resources.enabledModules || {}).records || [], (m) => { em[m.id] = true; });
    const items = Object.keys(this.props.availableModules).sort();
    const itemFormatter = (key) => {
      let style = {};
      if (!em[key]) {
        style = { color: '#ccc' };
      }

      return (
        <li key={key} style={style}>
          {this.props.availableModules[key]} (<tt>{key}</tt>)
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

export default AboutEnabledModules;
