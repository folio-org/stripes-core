// the CORRECT implementation of this response is:
//
// export default (server) => {
//   server.post('/bl-users/password-reset/reset', () => {
//     return new Response(204, {}, '');
//   });
// };
//
// but for reasons unclear this results in a 201 instead of a 204.
// for other responses, e.g. forgotUsernameSuccess, a 204 is returned.
// without the additional 204, createResetPassword-test will fail.
// there's gotta be a config glitch somewhere, but I have not been
// able to find it. so SO frustrating.
//

export default (server) => {
  server.post('/bl-users/password-reset/reset', () => {
    return new Response(204, {}, '');
  }, 204);
};
