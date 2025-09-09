import { useMutation } from 'react-query';
import { useStripes } from '../../StripesContext';
import useOkapiKy from '../../useOkapiKy';

/**
 * return a POST mutator that accepts a single argument, id, corresponding
 * to an email, or phone number. On success, the endpoint will send a "reset
 * password" email to the primary email address on file for the given id. On
 * failure, it returns 400 with a body shaped like
 *   {
 *     { errors: [ { message, type, code, parameters: []}] },
 *     "total_records": 1
 *   }
 *
 */
const useWhoopsForgot = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const pathPrefix = stripes.okapi.authnUrl ? 'users-keycloak' : 'bl-users';

  const mutation = useMutation({
    mutationFn: (id) => ky.post(
      `${pathPrefix}/forgotten/username`, { json: { id } }
    ).json(),
  });

  return mutation;
};

export default useWhoopsForgot;
