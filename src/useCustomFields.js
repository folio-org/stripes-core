import { useQuery } from 'react-query';
import { useStripes } from './StripesContext';
import useOkapiKy from './useOkapiKy';

export default (interfaceId) => {
  const { discovery: { interfaceProviders } } = useStripes();

  // Find the module that provides both the interfaceId and `custom-fields`
  const module = interfaceProviders.find(m => {
    // First, check if the module we're looking at contains the interface
    // that should be a sibling of the `custom-fields` interface.
    const matchingInterface = m.provides.find(i => i.id === interfaceId);
    if (matchingInterface === undefined) return false;

    // OK, this module contains that sibling interface. So let's confirm
    // that this module also provides the `custom-fields` interface.
    return m.provides.find(i => i.id === 'custom-fields');
  });

  if (!module) {
    return [
      undefined,
      `${interfaceId} was not found in any module that also provides the "custom-fields" interface`,
      false
    ];
  }

  const ky = useOkapiKy();
  const response = useQuery(
    ['custom-fields', module.id],
    () => ky('custom-fields', {
      headers: {
        'x-okapi-module-id': module.id,
      }
    }).json(),
  );

  return [
    response.data?.customFields,
    response.error,
    response.isLoading
  ];
};
