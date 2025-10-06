import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';
import { noop } from 'lodash';

import useOkapiKy from '../useOkapiKy';
import {
  getLoginTenant,
} from '../loginServices';
import { useStripes } from '../StripesContext';

const useExchangeCode = (initSession = noop) => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const intl = useIntl();

  const urlParams = new URLSearchParams(window.location.search);
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
              'redirect-uri': `${window.location.protocol}//${window.location.host}/oidc-landing?tenant=${tenant}&client_id=${clientId}`,
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
