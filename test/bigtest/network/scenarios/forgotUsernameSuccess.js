export default (server) => {
  server.post('bl-users/forgotten/username', () => {
    return new Response(204, {}, '');
  });
};
