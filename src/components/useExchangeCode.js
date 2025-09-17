import { useState } from 'react';
import { useQuery } from 'react-query';
import { useIntl } from 'react-intl';

import useOkapiKy from '../useOkapiKy';
import {
  getLoginTenant,
} from '../loginServices';
import { useStripes } from '../StripesContext';

const useExchangeCode = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const intl = useIntl();

  const [error, setError] = useState();

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const { tenant, clientId } = getLoginTenant(stripes.okapi, stripes.config);

  const { isFetching, data } = useQuery(
    ['@folio/stripes-core', 'authn/token'],
    () => {
      if (code) {
        return ky('authn/token', {
          searchParams: {
            code,
            'redirect-uri': `${window.location.protocol}//${window.location.host}/oidc-landing?tenant=${tenant}&client_id=${clientId}`,
          }
        })
          .json();
      }

      throw new Error(intl.formatMessage({ id: 'stripes-core.oidc.otp.missingCode' }));
    },
    {
      retry: false,
      onError: (e) => {
        // pull error message from an API response if present,
        // or directly from the Error object thrown during fetch
        if (e?.response?.json) {
          e.response.json()
            .then(json => {
              setError(json);
            });
        } else {
          setError({ errors: [{ message: e.message }] });
        }
      }

    }
  );

  return ({
    data,
    isLoading: isFetching,
    error,
  });
};

export default useExchangeCode;
