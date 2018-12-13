export default (server) => {
  server.post('/bl-users/password-reset/validate', {
    errors: [
      {
        type: 'error',
        code: 'link.expired',
      },
    ]
  }, 422);
};
