import useNamespace from './useNamespace';

// Namespace HOC which exposes namespace and getNamespace via props.

// Example usage:

// withNamespace(WrappedComponent, { key: 'test' });

const withNamespace = (Component, options) => {
  function NamespaceHOC(props) {
    const [namespace, getNamespace] = useNamespace(options);

    return (
      <Component
        {...props}
        namespace={namespace}
        getNamespace={getNamespace}
      />
    );
  }

  return NamespaceHOC;
};

export default withNamespace;
