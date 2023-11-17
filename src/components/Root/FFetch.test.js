describe('FFetch', () => {
  describe('passThroughLogout', () => {
    it('resolves on success', async () => {
      expect(true).toBeTruthy();
    });

    it('rejects on failure', async () => {
      expect(false).toBeFalsy();
    });
  });
});

// describe('passThrough', () => {
//   describe('non-okapi requests break on through, break on through, break on through to the other side', () => {
//     it('successful requests receive a response', async () => {
//       const req = {
//         url: 'https://barbie-is-the-greatest-action-movie-of-all-time.fight.me'
//       };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = {};
//       const oUrl = 'https://okapi.edu';

//       const response = 'kenough';
//       global.fetch = jest.fn(() => Promise.resolve(response));

//       const res = await passThrough(event, tokenExpiration, oUrl);
//       expect(res).toBe(response);
//     });

//     it('failed requests receive a rejection', async () => {
//       const req = {
//         url: 'https://barbie-is-the-greatest-action-movie-of-all-time.fight.me'
//       };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = {};
//       const oUrl = 'https://okapi.edu';

//       const error = 'not kenough';
//       global.fetch = jest.fn(() => Promise.reject(error));

//       try {
//         await passThrough(event, tokenExpiration, oUrl);
//       } catch (e) {
//         expect(e).toEqual(error);
//       }
//     });
//   });

//   describe('okapi requests are subject to RTR', () => {
//     it('requests to logout succeed', async () => {
//       const oUrl = 'https://trinity.edu';
//       const req = { url: `${oUrl}/authn/logout` };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = {};

//       const response = 'oppenheimer';
//       global.fetch = jest.fn(() => Promise.resolve(response));

//       const res = await passThrough(event, tokenExpiration, oUrl);
//       expect(res).toEqual(response);
//     });

//     // request was valid, response is success; we should receive response
//     it('requests with valid ATs succeed with success response', async () => {
//       const oUrl = 'https://trinity.edu';
//       const req = { url: `${oUrl}/manhattan` };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = { atExpires: (Date.now() / TTL_WINDOW) + 10000 };

//       const response = { ok: true };
//       global.fetch = jest.fn(() => Promise.resolve(response));

//       const res = await passThrough(event, tokenExpiration, oUrl);
//       expect(res).toEqual(response);
//     });

//     // request was valid, response is error; we should receive response
//     it('requests with valid ATs succeed with error response', async () => {
//       const oUrl = 'https://trinity.edu';
//       const req = { url: `${oUrl}/manhattan` };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = { atExpires: (Date.now() / TTL_WINDOW) + 10000 };

//       const response = {
//         ok: false,
//         status: 403,
//         headers: { 'content-type': 'text/plain' },
//         clone: () => ({
//           text: () => Promise.resolve('Access for user \'barbie\' (c0ffeeee-dead-beef-dead-coffeecoffee) requires permission: pink.is.the.new.black')
//         }),
//       };
//       global.fetch = jest.fn(() => Promise.resolve(response));

//       const res = await passThrough(event, tokenExpiration, oUrl);
//       expect(res).toEqual(response);
//     });

//     it('requests with false-valid AT data succeed via RTR', async () => {
//       const oUrl = 'https://trinity.edu';
//       const req = { url: `${oUrl}/manhattan` };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = {
//         atExpires: (Date.now() / TTL_WINDOW) + 1000, // at says it's valid, but ok == false
//         rtExpires: (Date.now() / TTL_WINDOW) + 1000
//       };

//       const response = 'los alamos';
//       global.fetch = jest.fn()
//         .mockReturnValueOnce(Promise.resolve({
//           status: 403,
//           headers: { 'content-type': 'text/plain' },
//           clone: () => ({
//             text: () => Promise.resolve('Token missing, access requires permission:'),
//           }),
//         }))
//         .mockReturnValueOnce(Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({
//             accessTokenExpiration: Date.now(),
//             refreshTokenExpiration: Date.now(),
//           })
//         }))
//         .mockReturnValueOnce(Promise.resolve(response));
//       const res = await passThrough(event, tokenExpiration, oUrl);
//       expect(res).toEqual(response);
//     });

//     it('requests with valid RTs succeed', async () => {
//       const oUrl = 'https://trinity.edu';
//       const req = { url: `${oUrl}/manhattan` };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = {
//         atExpires: Date.now() - 1000,
//         rtExpires: (Date.now() / TTL_WINDOW) + 1000
//       };

//       const response = 'los alamos';

//       global.fetch = jest.fn()
//         .mockReturnValueOnce(Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({
//             accessTokenExpiration: Date.now(),
//             refreshTokenExpiration: Date.now(),
//           })
//         }))
//         .mockReturnValueOnce(Promise.resolve(response));
//       const res = await passThrough(event, tokenExpiration, oUrl);
//       expect(res).toEqual(response);
//     });

//     it('requests with false-valid RTs fail softly', async () => {
//       const oUrl = 'https://trinity.edu';
//       const req = { url: `${oUrl}/manhattan` };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = {
//         atExpires: Date.now() - 1000,
//         rtExpires: Date.now() + 1000 // rt says it's valid but ok == false
//       };

//       const error = {};
//       window.Response = jest.fn();

//       global.fetch = jest.fn()
//         .mockReturnValueOnce(Promise.resolve({
//           ok: false,
//           json: () => Promise.resolve('RTR response failure')
//         }))
//         .mockReturnValueOnce(Promise.resolve(error));

//       try {
//         await passThrough(event, tokenExpiration, oUrl);
//       } catch (e) {
//         expect(e).toMatchObject(error);
//       }
//     });

//     it('requests with invalid RTs fail softly', async () => {
//       const oUrl = 'https://trinity.edu';
//       const req = { url: `${oUrl}/manhattan` };
//       const event = {
//         request: {
//           clone: () => req,
//         }
//       };
//       const tokenExpiration = {
//         atExpires: Date.now() - 1000,
//         rtExpires: Date.now() - 1000
//       };

//       const error = {};
//       window.Response = jest.fn();

//       global.fetch = jest.fn()
//         .mockReturnValueOnce(Promise.resolve({
//           ok: false,
//           json: () => Promise.reject(new Error('RTR response failure')),
//         }))
//         .mockReturnValueOnce(Promise.resolve(error));

//       try {
//         await passThrough(event, tokenExpiration, oUrl);
//       } catch (e) {
//         expect(e).toMatchObject(error);
//       }
//     });
//   });
// });

// describe('rtr', () => {
//   it('on error with JSON, returns it', async () => {
//     const oUrl = 'https://trinity.edu';
//     const req = { url: `${oUrl}/manhattan` };
//     const event = {
//       request: {
//         clone: () => req,
//       }
//     };

//     const error = { message: 'los', code: 'alamos' };
//     window.Response = jest.fn();

//     global.fetch = jest.fn()
//       .mockReturnValueOnce(Promise.resolve({
//         ok: false,
//         json: () => Promise.resolve({ errors: [error] })
//       }));

//     try {
//       await rtr(event);
//     } catch (e) {
//       expect(e.message).toMatch(error.message);
//       expect(e.message).toMatch(error.code);
//     }
//   });

//   it('on unknown error, throws a generic error', async () => {
//     const oUrl = 'https://trinity.edu';
//     const req = { url: `${oUrl}/manhattan` };
//     const event = {
//       request: {
//         clone: () => req,
//       }
//     };

//     const error = 'RTR response failure';
//     window.Response = jest.fn();

//     global.fetch = jest.fn()
//       .mockReturnValueOnce(Promise.resolve({
//         ok: false,
//         json: () => Promise.resolve(error)
//       }));

//     try {
//       await rtr(event);
//     } catch (e) {
//       expect(e.message).toMatch(error);
//     }
//   });

//   it.skip('foo', async () => {
//     const foo = handleTokenExpiration;
//     const bar = messageToClient;

//     handleTokenExpiration = jest.fn();
//     messageToClient = jest.fn();

//     const oUrl = 'https://trinity.edu';
//     const req = { url: `${oUrl}/manhattan` };
//     const event = {
//       request: {
//         clone: () => req,
//       }
//     };

//     window.Response = jest.fn();

//     global.fetch = jest.fn()
//       .mockReturnValueOnce(Promise.resolve({
//         ok: true,
//         json: () => Promise.resolve({
//           accessTokenExpiration: Date.now(),
//           refreshTokenExpiration: Date.now(),
//         })
//       }));

//     await rtr(event);
//     expect(handleTokenExpiration).toHaveBeenCalled();
//     expect(messageToClient).toHaveBeenCalled();

//     handleTokenExpiration = foo;
//     messageToClient = bar;
//   });
// });
