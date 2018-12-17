export default (server) => {
  server.post('/bl-users/password-reset/reset', {}, 401);
};
