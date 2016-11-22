import React from 'react';
import Match from 'react-router/Match';
import { connectFor } from '@folio/stripes-connect';
import { modules } from 'stripes-loader!';

if (!Array.isArray(modules.app) && modules.length < 0) {
  throw new Error('At least one module of type "app" must be enabled.');
}

export default modules.app.map((module) => {
  const connect = connectFor(module);
  const Current = connect(module.getModule());
  return (
    <Match
      pattern={module.route}
      key={module.route}
      render={props => <Current {...props} connect={connect} />}
    />
  );
});
