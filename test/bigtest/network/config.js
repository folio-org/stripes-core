import { okapi } from 'stripes-config';
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

  this.get('/users', {});
  this.post('/bl-users/password-reset/validate', {}, 204);
  this.post('/bl-users/password-reset/reset', {}, 401);


  this.post('/bl-users/login', () => {
    return new Response(201, {
      'X-Okapi-Token': `myOkapiToken:${Date.now()}`
    }, {
      user: {
        id: 'test',
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

  // hot-reload passthrough
  this.pretender.get('/:rand.hot-update.json', this.pretender.passthrough);

  // translations passthrough
  // eslint-disable-next-line no-undef, camelcase
  this.pretender.get(`${__webpack_public_path__}translations/:file`, this.pretender.passthrough);
}
