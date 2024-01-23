export default (server) => {
  server.get('/bl-users/_self', {
    'user': {
      'username': 'diku_admin',
      'id': '882c886a-2d9a-5ffa-afc5-13912c257b99',
      'active': true,
      'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
      'proxyFor': [
      ],
      'personal': {
        'lastName': 'ADMINISTRATOR',
        'firstName': 'DIKU',
        'email': 'admin@diku.example.org',
        'addresses': [
        ]
      },
      'createdDate': '2024-01-22T01:55:50.661+00:00',
      'updatedDate': '2024-01-22T01:55:50.661+00:00',
      'metadata': {
        'createdDate': '2024-01-22T01:52:08.076+00:00',
        'updatedDate': '2024-01-22T01:55:50.656+00:00',
        'updatedByUserId': '882c886a-2d9a-5ffa-afc5-13912c257b99'
      },
      'departments': [
      ]
    },
    'permissions': {
      'permissions': ['configuration.entries.collection.get']
    }
  });
}