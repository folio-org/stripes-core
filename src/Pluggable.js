import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getModules, legacyModules } from './entitlementService';
import { withStripes } from './StripesContext';
import { ModuleHierarchyProvider } from './components';

const Pluggable = (props) => {
  const [modules, setModules] = useState(legacyModules);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  // Load modules asynchronously
  useEffect(() => {
    getModules()
      .then(moduleData => {
        setModules(moduleData);
        setModulesLoaded(true);
      })
      .catch(() => {
        // Fall back to legacy modules if async loading fails
        setModules(legacyModules);
        setModulesLoaded(true);
      });
  }, []);

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
        const Child = props.stripes.connect(best.getModule());

        cached.push({
          Child,
          plugin: best.module
        });
      }
    }

    return cached;
    // props.stripes is not stable on each re-render, which causes an infinite trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plugins, modulesLoaded]);

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
