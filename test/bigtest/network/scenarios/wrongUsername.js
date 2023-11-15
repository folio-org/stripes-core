export default (server) => {
  server.post('bl-users/login-with-expiry', {
    errorMessage: JSON.stringify(
      { errors: [
        {
          type: 'error',
          code: 'username.incorrect',
          parameters: [
            {
              key: 'username',
              value: 'username',
            },
          ]
        }
      ] }
    )
  }, 422);
};
