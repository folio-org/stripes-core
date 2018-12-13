export default (server) => {
  server.post('/bl-users/password-reset/reset', {
    errorMessage: JSON.stringify({
      errors: [
        {
          type: 'error',
          code: 'link.expired',
        },
      ]
    })
  }, 422);
};
