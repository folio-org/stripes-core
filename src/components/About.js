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
      <div>
        <h4>{n} {caption} module{n === 1 ? '' : 's'}</h4>
        <ul>
          {
            list.map(m => <li>{m.module} {m.version}</li>)
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
        <li>stripes-core {stripesCore.version}</li>
        <li>stripes-loader {stripesLoader.version}</li>
        <li>stripes-connect {stripesConnect.version}</li>
        <li>stripes-components {stripesComponents.version}</li>
        <li>stripes-logger {stripesLogger.version}</li>
      </ul>
      {listModules('application', modules.app)}
      {listModules('settings', modules.settings)}
    </div>
  );
};

export default About;
