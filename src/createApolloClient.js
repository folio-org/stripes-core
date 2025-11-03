import { InMemoryCache, ApolloClient, HttpLink } from '@apollo/client';

const createClient = ({ tenant, token, url }) => (new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    credentials: 'include',
    headers: {
      'X-Okapi-Tenant': tenant,
      ...(token && { 'X-Okapi-Token': token }),
    },
    uri: `${url}/graphql`,
  }),
}));

export default createClient;

