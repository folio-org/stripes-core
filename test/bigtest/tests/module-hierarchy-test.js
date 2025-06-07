import React from 'react';

import { describe, beforeEach, it } from 'mocha';
import {
  HTML,
} from '@folio/stripes-testing';

import setupApplication from '../helpers/setup-core-application';

import { useModuleHierarchy } from '../../../src/components';
import Pluggable from '../../../src/Pluggable';

import {
  AppListInteractor
} from '../interactors/app';

const ModuleHierarchyInteractor = HTML.extend('Module Hierarchy')
  .selector('#module-hierarchy')
  .filters({
    names: el => el.innerText
  });


const PrintModuleHierarchy = () => {
  const moduleHierarchy = useModuleHierarchy();

  return <div id="module-hierarchy">{moduleHierarchy.join(':')}</div>;
};
const ModuleA = () => (
  <Pluggable type="plugin-a" />
);
const ModuleB = () => <PrintModuleHierarchy />;
const PluginB = () => <PrintModuleHierarchy />;

describe('ModuleHierarchy', () => {
  const nav = AppListInteractor();
  const moduleHierarchy = ModuleHierarchyInteractor();

  setupApplication({
    modules: [
      {
        type: 'app',
        name: '@folio/ui-module-a',
        displayName: 'module-a.title',
        route: '/module-a',
        module: ModuleA,
      },
      {
        type: 'app',
        name: '@folio/ui-module-b',
        displayName: 'module-b.title',
        route: '/module-b',
        module: ModuleB,
      },
      {
        type: 'plugin',
        name: '@folio/plugin-a',
        displayName: 'plugin-a.title',
        pluginType: 'plugin-a',
        module: PluginB,
      },
    ],
    translations: {
      'module-a.title': 'ModuleA',
      'module-b.title': 'ModuleB',
      'plugin-a.title': 'PluginA',
    },
  });

  describe('open app with pluggable', () => {
    beforeEach(async () => {
      await nav.choose('ModuleA');
    });

    it('shows full hierarchy', () => moduleHierarchy.has({ names: '@folio/ui-module-a:@folio/plugin-a' }));
  });

  describe('open app without pluggable', () => {
    beforeEach(async () => {
      await nav.choose('ModuleB');
    });

    it('shows full hierarchy', () => moduleHierarchy.has({ names: '@folio/ui-module-b' }));
  });
});
