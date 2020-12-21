import { InMemoryCache, ApolloClient } from '@apollo/client';

const createClient = ({ url, tenant, token }) => (new ApolloClient({
  uri: `${url}/graphql`,
  headers: {
    'X-Okapi-Tenant': tenant,
    'X-Okapi-Token': token,
  },
  cache: new InMemoryCache(),
}));

export default createClient;
