export default (server) => {
  server.post('/bl-users/password-reset/reset', {
    errorMessage: JSON.stringify({
      errors: [
        {
          type: 'error',
          code: 'link.expired',
        },
      ]
    })
  }, 422);

  server.get('/tenant/rules', () => {
    return new Response(200, {
      rules: [
        {
          ruleId: '5105b55a-b9a3-4f76-9402-a5243ea63c95',
          name: 'password_length',
          type: 'RegExp',
          validationType: 'Strong',
          state: 'Enabled',
          moduleName: 'mod-password-validator',
          expression: '^.{8,}$',
          description: 'The password length must be at least 8 characters long',
          orderNo: 0,
          errMessageId: 'password.length.invalid'
        }
      ],
      totalRecords: 1
    }, '');
  });
};
