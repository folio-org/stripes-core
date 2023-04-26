import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useModules } from './ModulesContext';
import { withStripes } from './StripesContext';
import { ModuleHierarchyProvider } from './components';
import loadRemoteComponent from './loadRemoteComponent';

const Pluggable = (props) => {
  const modules = useModules();
  const plugins = modules.plugin || [];
  const cachedPlugins = useMemo(() => {
    const cached = [];
    let best;

    const wanted = props.stripes.plugins[props.type];
    // "@@" is a special case of explicitly chosen "no plugin"
    if (!wanted || wanted !== '@@') {
      for (const name of Object.keys(plugins)) {
        const m = plugins[name];
        if (m.pluginType === props.type) {
          best = m;
          if (m.module === wanted) break;
        }
      }

      if (best) {
        const RemoteComponent = React.lazy(() => loadRemoteComponent(best.url, best.name));
        const Child = props.stripes.connect(RemoteComponent);

        cached.push({
          Child,
          plugin: best.module
        });
      }
    }

    return cached;
  }, [plugins]);

  if (cachedPlugins.length) {
    return cachedPlugins.map(({ plugin, Child }) => (
      <ModuleHierarchyProvider module={plugin} key={plugin}>
        <Child {...props} actAs="plugin" />
      </ModuleHierarchyProvider>
    ));
  }

  if (!props.children) return null;
  if (props.children.length) {
    // eslint-disable-next-line no-console
    console.error(`<Pluggable type="${props.type}"> has ${props.children.length} children, can only return one`);
  }
  return props.children;
};

Pluggable.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  stripes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

export default withStripes(Pluggable);
