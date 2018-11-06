export default (server) => {
  server.post('bl-users/login', {
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
