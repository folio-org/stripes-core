export default (server) => {
  server.post('bl-users/forgotten/username', {
    errors: [
      {
        type: 'error',
        code: 'forgotten.password.found.inactive'
      }
    ]
  }, 422);
};
