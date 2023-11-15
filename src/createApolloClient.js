import { InMemoryCache, ApolloClient } from '@apollo/client';

const createClient = ({ url, tenant }) => (new ApolloClient({
  uri: `${url}/graphql`,
  credentials: 'include',
  headers: {
    'X-Okapi-Tenant': tenant,
  },
  cache: new InMemoryCache(),
}));

export default createClient;
