export default (server) => {
  server.post('/bl-users/password-reset/validate', {
    errors: [
      {
        type: 'error',
        code: 'link.used',
      },
    ]
  }, 422);
};
