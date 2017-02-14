import mockReq from 'mock-require';
import chai from 'chai';
import { shallow } from 'enzyme';

import Match from 'react-router/Match';

chai.should();

global.OKAPI_URL = 'http://localhost:9130';

mockReq('stripes-loader', { modules: {
  app: [ {
    displayName: 'someApp',
    module: 'some-app',
    getModule: () => () => 'Close enough to a React component for this purpose.',
    route: '/someapp' 
  } ]
} });

mockReq('some-app', () => <div></div>);

const routes = require('../src/moduleRoutes').default;
const inst = shallow(routes[0]).instance();
describe('routes', () => {
  it('should be an array of Match components', () => {
    routes.should.be.a('array');
    inst.should.be.instanceOf(Match);
  });
});
