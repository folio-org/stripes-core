export default (server) => {
  server.post('bl-users/login-with-expiry', {
    errorMessage: JSON.stringify(
      { errors: [
        {
          type: 'error',
          code: 'password.incorrect',
        },
      ] }
    )
  }, 422);
};
