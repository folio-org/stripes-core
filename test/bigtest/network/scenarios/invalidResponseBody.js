export default (server) => {
  server.post('bl-users/login-with-expiry', {
    errorMessage: JSON.stringify(['test'])
  }, 422);
};
