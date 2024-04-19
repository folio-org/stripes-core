import { okapi } from 'stripes-config';
import { Response } from 'miragejs';

// typical mirage config export
export default function configure() {
  this.urlPrefix = okapi.url;

  // okapi endpoints
  this.get('/_/version', () => '0.0.0');

  this.get('_/proxy/tenants/:id/modules', [{
    id : 'mod-users-42.0.0-EXAMPLE.12345',
    name : 'users',
    provides : [{
      id : 'users',
      version : '42.0',
      handlers : []
    }, {
      id : 'custom-fields',
      version : '2.0',
      interfaceType : 'multiple',
      handlers : [{
        methods : ['GET'],
        pathPattern : '/custom-fields',
        permissionsRequired : []
      }]
    }],
    permissionSets : [],
    launchDescriptor : {}
  }]);

  this.get('/service-worker.js', {
    monkey: 'bagel'
  });
  this.get('/_/env', {
    monkey: 'bagel'
  });

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/configurations/entries', {
    configs: []
  });

  this.get('/bl-users/_self', {
    'user': {
      'username': 'diku_admin',
      'id': '882c886a-2d9a-5ffa-afc5-13912c257b99',
      'active': true,
      'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
      'proxyFor': [
      ],
      'personal': {
        'lastName': 'ADMINISTRATOR',
        'firstName': 'DIKU',
        'email': 'admin@diku.example.org',
        'addresses': [
        ]
      },
      'createdDate': '2024-01-22T01:55:50.661+00:00',
      'updatedDate': '2024-01-22T01:55:50.661+00:00',
      'metadata': {
        'createdDate': '2024-01-22T01:52:08.076+00:00',
        'updatedDate': '2024-01-22T01:55:50.656+00:00',
        'updatedByUserId': '882c886a-2d9a-5ffa-afc5-13912c257b99'
      },
      'departments': [
      ]
    }
  });

  this.post('/bl-users/password-reset/validate', () => {
    return new Response(204, {}, '');
  });
  this.post('/bl-users/password-reset/reset', {}, 401);

  this.post('/authn/logout', {}, 204);

  this.post('/bl-users/login', () => {
    return new Response(201, {}, {
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

  this.post('/bl-users/login-with-expiry', () => {
    return new Response(201, {}, {
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

  this.get('/custom-fields', (_schema, request) => {
    const customFields = [];

    if (request.requestHeaders['x-okapi-module-id'] === 'mod-users-42.0.0-EXAMPLE.12345') {
      customFields.push({
        id: 'a9aae99c-9176-4c46-852f-62437b0e3434',
        name: 'Sponsor information',
        refId: 'sponsorInformation',
        type: 'TEXTBOX_LONG',
        entityType: 'user',
        visible: true,
        required: false,
        isRepeatable: false,
        order: 4,
        helpText: 'Record sponsor information for sponsored accounts',
        textField: {
          fieldFormat: 'TEXT'
        }
      });
    }

    return new Response(
      200,
      {},
      { customFields }
    );
  });

  // hot-reload passthrough
  this.pretender.get('/:rand.hot-update.json', this.pretender.passthrough);

  // translations passthrough
  // eslint-disable-next-line no-undef, camelcase
  this.pretender.get(`${__webpack_public_path__}translations/:file`, this.pretender.passthrough);
}
