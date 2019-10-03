export default (server) => {
  server.post('/bl-users/password-reset/reset', {
    errors: [
      {
        type: 'error',
        code: 'link.invalid',
      },
    ]
  }, 422);
};
