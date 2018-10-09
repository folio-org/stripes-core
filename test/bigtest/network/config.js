import { okapi } from 'stripes-config';
import { Response } from '@bigtest/mirage';
import {
  wrongUsername,
  fifthAttempt,
  thirdAttempt,
  multipleErrors,
  serverError,
  wrongPassword,
  userLocked,
  invalidResponce,
} from '../constants';

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

  this.post('/bl-users/login', (schema, request) => {
    const formData = JSON.parse(request.requestBody);

    switch (formData.username) {
      case serverError:
        return new Response(500, []);
      case wrongUsername:
        return new Response(422, {}, {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'username.invalid',
                parameters: [
                  {
                    key: 'username',
                    value: wrongUsername,
                  },
                ]
              }
            ] }
          )
        });
      case wrongPassword:
        return new Response(422, {}, {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'password.invalid',
              }
            ] }
          )
        });
      case thirdAttempt:
        return new Response(422, {}, {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'third.failed.attempt',
              }
            ] }
          )
        });
      case fifthAttempt:
        return new Response(422, {}, {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'fifth.failed.attempt.blocked',
              }
            ] }
          )
        });
      case userLocked:
        return new Response(422, {}, {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'user.blocked',
              }
            ] }
          )
        });
      case multipleErrors:
        return new Response(422, {}, {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'user.blocked',
              },
              {
                type: 'error',
                code: 'third.failed.attempt',
              },
            ] }
          )
        });
      case invalidResponce:
        return new Response(422, {}, {
          errorMessage: JSON.stringify(['test'])
        });
      default:
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
    }
  });

  // hot-reload passthrough
  this.pretender.get('/:rand.hot-update.json', this.pretender.passthrough);

  // translations passthrough
  // eslint-disable-next-line no-undef, camelcase
  this.pretender.get(`${__webpack_public_path__}translations/:file`, this.pretender.passthrough);
}
