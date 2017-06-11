import _ from 'lodash';
import React, { PropTypes } from 'react';
import { modules as uiModules } from 'stripes-loader'; // eslint-disable-line

import stripesCore from '@folio/stripes-core/package.json'; // eslint-disable-line
import stripesLoader from '@folio/stripes-loader/package.json';
import stripesConnect from '@folio/stripes-connect/package.json';
import stripesComponents from '@folio/stripes-components/package.json';
import stripesLogger from '@folio/stripes-logger/package.json';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';

const About = (props) => {
  function listModules(caption, list) {
    const n = list.length;
    return (
      <div key={caption}>
        <h4>{n} {caption} module{n === 1 ? '' : 's'}</h4>
        <ul>
          {
            list.map(m => <li key={m.module}>{m.module} {m.version}</li>)
          }
        </ul>
      </div>
    );
  }

  const modules = _.get(props.stripes, ['discovery', 'modules']) || {};
  const interfaces = _.get(props.stripes, ['discovery', 'interfaces']) || {};
  const nm = Object.keys(modules).length;
  const ni = Object.keys(interfaces).length;

  return (
    <Paneset>
      <Pane defaultWidth="50%" paneTitle="User interface">
        <h4>Foundation</h4>
        <ul>
          <li key="stripes-core">stripes-core {stripesCore.version}</li>
          <li key="stripes-loader">stripes-loader {stripesLoader.version}</li>
          <li key="stripes-connect">stripes-connect {stripesConnect.version}</li>
          <li key="stripes-components">stripes-components {stripesComponents.version}</li>
          <li key="stripes-logger">stripes-logger {stripesLogger.version}</li>
        </ul>
        {Object.keys(uiModules).map(key => listModules(key, uiModules[key]))}
      </Pane>
      <Pane defaultWidth="50%" paneTitle="Okapi services">
        <h4>{nm} module{nm === 1 ? '' : 's'}</h4>
        <ul>
          {Object.keys(modules).sort().map(key => <li key={key}>{modules[key]} (<tt>{key}</tt>)</li>)}
        </ul>

        <h4>{ni} interface{ni === 1 ? '' : 's'}</h4>
        <ul>
          {Object.keys(interfaces).sort().map(key => <li key={key}>{key} v{interfaces[key]}</li>)}
        </ul>
      </Pane>
    </Paneset>
  );
};

About.propTypes = {
  stripes: PropTypes.shape({
    discovery: PropTypes.shape({
      modules: PropTypes.object,
      interfaces: PropTypes.object,
    }),
  }).isRequired,
};

export default About;
