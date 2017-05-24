import React from 'react';
import { modules } from 'stripes-loader'; // eslint-disable-line

import stripesCore from '@folio/stripes-core/package.json'; // eslint-disable-line
import stripesLoader from '@folio/stripes-loader/package.json';
import stripesConnect from '@folio/stripes-connect/package.json';
import stripesComponents from '@folio/stripes-components/package.json';
import stripesLogger from '@folio/stripes-logger/package.json';

const About = () => {
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

  return (
    <div>
      <h3>About Stripes</h3>
      <h4>Foundation</h4>
      <ul>
        <li key="stripes-core">stripes-core {stripesCore.version}</li>
        <li key="stripes-loader">stripes-loader {stripesLoader.version}</li>
        <li key="stripes-connect">stripes-connect {stripesConnect.version}</li>
        <li key="stripes-components">stripes-components {stripesComponents.version}</li>
        <li key="stripes-logger">stripes-logger {stripesLogger.version}</li>
      </ul>
      {Object.keys(modules).map(key => listModules(key, modules[key]))}
    </div>
  );
};

export default About;
