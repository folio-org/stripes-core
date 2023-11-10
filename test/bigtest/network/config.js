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

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/configurations/entries', {
    configs: []
  });

  this.get('/bl-users/_self', {});
  this.post('/bl-users/password-reset/validate', () => {
    return new Response(204, {}, '');
  });
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
