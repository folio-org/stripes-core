import React from 'react';
import PropTypes from 'prop-types';
import { modules } from 'stripes-config';
import { withStripes } from './StripesContext';

const Pluggable = (props) => {
  const plugins = modules.plugin || [];
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
      return <Child {...props} actAs="plugin" />;
    }
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
