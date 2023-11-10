export default (server) => {
  server.post('bl-users/login', {
    errorMessage: JSON.stringify(['test'])
  }, 422);
};
