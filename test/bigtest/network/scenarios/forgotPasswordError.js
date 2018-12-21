export default (server) => {
  server.post('bl-users/forgotten/password', {
    errors: [
      {
        code: 'unable.locate.account',
        type: 'error'
      }
    ]
  }, 422);
};
