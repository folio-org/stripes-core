export default (server) => {
  server.get('_/proxy/tenants/:id/modules', { errorMessage: 'Invalid token' }, 401);
};
