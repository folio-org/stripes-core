import { okapi } from 'stripes-config'; // eslint-disable-line
import { Response } from '@bigtest/mirage';

// typical mirage config export
export default function configure() {
  this.urlPrefix = okapi.url;

  // okapi endpoints
  this.get('/_/version', () => '0.0.0');

  this.get('_/proxy/tenants/:id/modules', []);

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/configurations/entries', {
    configs: []
  });

  this.post('/bl-users/login', () => {
    return new Response(201, {
      'X-Okapi-Token': `myOkapiToken:${Date.now()}`
    }, {
      user: {
        username: 'testuser',
        personal: {
          lastName: 'User',
          firstName: 'Test',
          email: 'user@folio.org',
        }
      },
      permissions: {
        permissions: []
      }
    });
  });

  this.get('/notify/_self', {
    notifications: [],
    totalRecords: 0
  });

  this.get('/notify', {
    notifications: [],
    totalRecords: 0
  });

  // translation bundle passthrough
  this.pretender.get(`${__webpack_public_path__}translations/:rand.json`, this.pretender.passthrough); // eslint-disable-line

  // hot-reload passthrough
  this.pretender.get('/:rand.hot-update.json', this.pretender.passthrough);
}
