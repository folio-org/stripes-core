import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import { noop } from 'lodash';

import { usePublicGatewayKy } from '../useOkapiKy';
import {
  getLoginTenant,
} from '../loginServices';
import { useStripes } from '../StripesContext';

/**
 * useExchangeCode
 * Pull Keycloak's OTP off the URL and pass it in an API request to /authn/token,
 * receiving cookies in response. Throw if the OTP is missing or if there are
 * any problems with the exchange.
 *
 * The initSession callback is async but not awaited, which feels suspicious.
 * It updates redux state, and much of the rest of Stripes reacts to redux
 * changes rather than API responses. It works, but this reliance on side-
 * effects can be opaque since the side-effects are not always co-located with
 * the promises that kick them off.
 *
 * @param {} initSession
 * @returns
 */
const useExchangeCode = (initSession = noop) => {
  const stripes = useStripes();
  const ky = usePublicGatewayKy();
  const intl = useIntl();

  const urlParams = new URLSearchParams(globalThis.location.search);
  const code = urlParams.get('code');
  const { tenant, clientId } = getLoginTenant(stripes.okapi, stripes.config);

  const { isFetching, data, error } = useQuery(
    ['@folio/stripes-core', 'authn/token', code],
    async () => {
      if (code) {
        try {
          const json = await ky('authn/token', {
            searchParams: {
              code,
              'redirect-uri': `${globalThis.location.protocol}//${globalThis.location.host}/oidc-landing?tenant=${tenant}&client_id=${clientId}`,
            }
          }).json();

          // note: initSession is expected to execute an unawaited promise.
          // initSession calls .../_self and other functions in order to
          // populate the session, eventually dispatching redux actions
          // (isAuthenticated, sessionData, okapiReady), triggering
          // RootWithIntl to re-render.
          //
          // return the json response from `authn/token` in order to
          // show a status update on the calling page while session-init
          // is still in-flight.
          initSession(json);

          return json;
        } catch (fetchError) {
          // throw json from the error-response, or just rethrow
          if (fetchError?.response?.json) {
            const errorJson = await fetchError.response.json();
            throw errorJson;
          }

          throw fetchError;
        }
      }

      // eslint-disable-next-line no-throw-literal
      throw intl.formatMessage({ id: 'stripes-core.oidc.otp.missingCode' });
    },
    {
      retry: false,
    }
  );

  return ({
    tokenData: data,
    isLoading: isFetching,
    error,
  });
};

export default useExchangeCode;
