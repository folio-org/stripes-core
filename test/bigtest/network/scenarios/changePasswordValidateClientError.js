export default (server) => {
  server.post('/bl-users/password-reset/validate', {}, 401);
};
