import * as stripes from 'stripes-config';

const { assign, keys } = Object;

export function withModule({
  name,
  module,
  type = 'app',
  displayName,
  fullName,
  ...config
}) {
  const moduleConfig = {
    module: name,
    getModule: () => module,
    displayName,
    fullName,
    ...config
  };

  const moduleMeta = {
    type,
    name: name.replace(/.*\//, ''),
    version: config.version,
    description: config.version,
    shortTitle: displayName,
    fullTitle: fullName,
    defaultPopoverSize: config.defaultPopoverSize,
    defaultPopoverWidth: config.defaultPopoverWidth,
    welcomePageEntries: config.welcomePageEntries,
    helpPage: config.helpPage,
    icons: config.icons
  };

  stripes.modules[type] = (stripes.modules[type] || []).concat(moduleConfig);
  stripes.metadata[name] = moduleMeta;
}

export function withModules(modules) {
  modules.forEach(withModule);
}

export function clearModules() {
  // delete existing modules and metadata
  keys(stripes.modules).forEach(type => {
    stripes.modules[type].forEach(module => {
      delete stripes.metadata[module.name];
    });

    delete stripes.modules[type];
  });

  // app is required
  stripes.modules.app = [];
}

const originalConfig = assign({}, stripes.config);

export function withConfig(config) {
  assign(stripes.config, config);
}

export function clearConfig() {
  assign(stripes.config, originalConfig);
}
