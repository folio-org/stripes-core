export default (server) => {
  server.post('/bl-users/password-reset/reset', () => {
    return new Response(204, {}, '');
  }, 204);
};
