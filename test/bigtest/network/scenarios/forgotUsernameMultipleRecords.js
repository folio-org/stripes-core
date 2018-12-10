export default (server) => {
  server.post('bl-users/forgotten/username', {
    errors: [
      {
        type: 'error',
        code: 'user.found.multiple.username'
      }
    ]
  }, 422);
};
