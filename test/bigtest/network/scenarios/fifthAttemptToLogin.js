export default (server) => {
  server.post('bl-users/login', {
    errorMessage: JSON.stringify(
      { errors: [
        {
          type: 'error',
          code: 'fifth.failed.attempt.blocked',
        }
      ] }
    )
  }, 422);
};
