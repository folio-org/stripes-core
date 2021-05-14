import { useState } from 'react';
import { useQuery } from 'react-query';

import { useStripes } from './StripesContext';
import useOkapiKy from './useOkapiKy';

import { isVersionCompatible } from './discoverServices';

export default (interfaceId, interfaceVersion) => {
  const [customFields, setCustomFields] = useState();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const { discovery: { interfaceProviders = [] } } = useStripes();

  // Find the module that provides both the interfaceId and `custom-fields`
  const module = interfaceProviders.find(m => {
    // First, check if the module we're looking at contains the interface
    // that should be a sibling of the `custom-fields` interface.
    const matchingInterface = m.provides.find(i => {
      if (i.id !== interfaceId) {
        return false;
      }

      return interfaceVersion ? isVersionCompatible(i.version, interfaceVersion) : true;
    });

    if (matchingInterface === undefined) return false;

    // OK, this module contains that sibling interface. So let's confirm
    // that this module also provides the `custom-fields` interface.
    return m.provides.find(i => i.id === 'custom-fields');
  });

  if (module && error) {
    setError(undefined);
  } else if (!module && !error) {
    setError(`Interface ${interfaceId}${interfaceVersion ? ` compatible with interface version ${interfaceVersion} ` : ' '}was not found in any module that also provides the "custom-fields" interface`);
    setIsLoading(false);
  }

  const ky = useOkapiKy();
  useQuery(
    ['custom-fields', module?.id],
    () => {
      setIsLoading(true);
      return ky('custom-fields', {
        headers: {
          'x-okapi-module-id': module?.id,
        }
      }).json();
    },
    {
      enabled: module?.id !== undefined,
      onError: err => setError(err),
      onSuccess: data => setCustomFields(data.customFields),
      onSettled: () => setIsLoading(false),
    }
  );

  return [customFields, error, isLoading];
};
