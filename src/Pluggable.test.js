import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { ModulesContext } from './ModulesContext';
import { StripesContext } from './StripesContext';
import Pluggable from './Pluggable';

jest.unmock('@folio/stripes-components');

const FindUserPlugin = () => <>find-user plugin</>;
const OtherPlugin = () => <>other plugin</>;

const buildPlugin = (pluginType, module, Component) => ({
  pluginType,
  module,
  getModule: () => Component,
});

const findUserPlugin = buildPlugin('find-user', '@folio/plugin-find-user', FindUserPlugin);
const otherPlugin = buildPlugin('find-po-line', '@folio/plugin-find-po-line', OtherPlugin);

const buildStripes = (plugins = {}) => ({
  connect: (Component) => Component,
  plugins,
});

const renderPluggable = ({ plugins = [], stripes = buildStripes(), children } = {}) => render(
  <StripesContext.Provider value={stripes}>
    <ModulesContext.Provider value={{ plugin: plugins }}>
      <Pluggable type="find-user">
        {children}
      </Pluggable>
    </ModulesContext.Provider>
  </StripesContext.Provider>
);

describe('Pluggable', () => {
  it('renders the plugin of the requested type when it is available', () => {
    renderPluggable({
      plugins: [otherPlugin, findUserPlugin],
      children: <>fallback</>,
    });
    expect(screen.getByText('find-user plugin')).toBeInTheDocument();
    expect(screen.queryByText('other plugin')).not.toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('renders fallback children when the bundle contains no plugins at all', () => {
    renderPluggable({ plugins: [], children: <>fallback</> });
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('renders fallback children when only plugins of other types are available', () => {
    renderPluggable({ plugins: [otherPlugin], children: <>fallback</> });
    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(screen.queryByText('other plugin')).not.toBeInTheDocument();
  });

  it('renders fallback children when "no plugin" (@@) is explicitly chosen', () => {
    renderPluggable({
      plugins: [findUserPlugin],
      stripes: buildStripes({ 'find-user': '@@' }),
      children: <>fallback</>,
    });
    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(screen.queryByText('find-user plugin')).not.toBeInTheDocument();
  });

  it('renders nothing when no plugin is available and there are no children', () => {
    const { container } = renderPluggable({ plugins: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
