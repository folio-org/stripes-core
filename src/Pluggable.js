import React, { Suspense, useMemo } from 'react';
import PropTypes from 'prop-types';
import { modules } from 'stripes-config';
import { withStripes } from './StripesContext';
import { ModuleHierarchyProvider } from './components';
import { Loading } from '@folio/stripes-components';

const Pluggable = (props) => {
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
  }, [plugins]);

  if (cachedPlugins.length) {
    return cachedPlugins.map(({ plugin, Child }) => (
      <ModuleHierarchyProvider module={plugin} key={plugin}>
        <Suspense fallback={<Loading />}>
          <Child {...props} actAs="plugin" />
        </Suspense>
      </ModuleHierarchyProvider>
    ));
  }

  if (!props.children) return null;
  if (props.children.length) {
    // eslint-disable-next-line no-console
    console.error(`<Pluggable type="${props.type}"> has ${props.children.length} children, can only return one`);
  }
  return (
    <Suspense fallback={<Loading />}>
      {props.children}
    </Suspense>
  );
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
