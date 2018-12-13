export default (server) => {
  server.post('bl-users/forgotten/password', {
    errors: [
      {
        type: 'error',
        code: 'forgotten.password.found.inactive'
      }
    ]
  }, 422);
};
