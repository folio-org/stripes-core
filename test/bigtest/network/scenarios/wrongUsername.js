export default (server) => {
  server.post('bl-users/login', {
    errorMessage: JSON.stringify(
      { errors: [
        {
          type: 'error',
          code: 'username.invalid',
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
