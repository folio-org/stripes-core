export default (server) => {
  server.post('bl-users/forgotten/password', {
    errors: [
      {
        type: 'error',
        code: 'forgotten.password.found.multiple.users'
      }
    ]
  }, 422);
};
