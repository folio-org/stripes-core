import React from 'react';
import Match from 'react-router/Match';
import { modules } from 'stripes-loader!';

if (!Array.isArray(modules.app) && modules.length < 0) {
  throw new Error('At least one module of type "app" must be enabled.');
}

export default modules.app.map(module =>
  <Match pattern={module.route} key={module.route} component={module.getModule()} />
);
