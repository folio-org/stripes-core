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
const useForgotPasswordMutation = () => {
  const stripes = useStripes();
  // this endpoint is called by an unauthenticated user, i.e. there is no
  // valid AT/RT pair yet. Without rtrIgnore, FFetch sees the missing token
  // expiry and jumps straight to RTR (POST /authn/refresh) instead of
  // sending the actual request, and that rotation attempt necessarily
  // fails since there is no session to refresh.
  const ky = useOkapiKy({ rtrIgnore: true });

  const pathPrefix = stripes.okapi.authnUrl ? 'users-keycloak' : 'bl-users';

  const mutation = useMutation({
    mutationFn: (id) => ky.post(
      `${pathPrefix}/forgotten/username`, { json: { id } }
    ).json(),
  });

  return mutation;
};

export default useForgotPasswordMutation;
