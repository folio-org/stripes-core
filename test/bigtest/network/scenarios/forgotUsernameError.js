export default (server) => {
  server.post('bl-users/forgotten/username', {
    errors: [
      {
        code: 'unable.locate.account',
        type: 'error'
      }
    ]
  }, 422);
};
