import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const createClient = okapi => (new ApolloClient({
  link: new HttpLink({
    uri: `${okapi.url}/graphql`,
    headers: {
      'X-Okapi-Tenant': okapi.tenant,
      'X-Okapi-Token': okapi.token,
    },
  }),
  cache: new InMemoryCache(),
}));

export default createClient;
