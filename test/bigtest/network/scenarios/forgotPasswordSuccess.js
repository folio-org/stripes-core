export default (server) => {
  server.post('bl-users/forgotten/password', () => {
    return new Response(204, {}, '');
  }, 204);
};
