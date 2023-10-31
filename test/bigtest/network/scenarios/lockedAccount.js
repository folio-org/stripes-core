export default (server) => {
  server.post('bl-users/login-with-expiry', {
    errorMessage: JSON.stringify(
      { errors: [
        {
          type: 'error',
          code: 'user.blocked',
        },
      ] }
    )
  }, 422);
};
