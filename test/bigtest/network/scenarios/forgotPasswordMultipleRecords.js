export default (server) => {
  server.post('bl-users/forgotten/password', {
    errors: [
      {
        type: 'error',
        code: 'user.found.multiple.password'
      }
    ]
  }, 422);
};
