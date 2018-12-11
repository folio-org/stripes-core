export default (server) => {
  server.post('bl-users/forgotten/username', {
    errors: [
      {
        type: 'error',
        code: 'forgotten.username.found.multiple.users'
      }
    ]
  }, 422);
};
