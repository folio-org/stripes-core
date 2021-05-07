import React from 'react';

import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-core-application';
import AppInteractor from '../interactors/app';

import { useModuleHierarchy } from '../../../src/components';
import Pluggable from '../../../src/Pluggable';
import ModuleHierarchyInteractor from '../interactors/ModuleHierarchy';

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
  const app = new AppInteractor();
  const moduleHierarchy = new ModuleHierarchyInteractor();

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
      await app.nav('ModuleA').click();
    });

    it('shows full hierarchy', () => {
      expect(moduleHierarchy.names).to.equal('@folio/ui-module-a:@folio/plugin-a');
    });
  });

  describe('open app without pluggable', () => {
    beforeEach(async () => {
      await app.nav('ModuleB').click();
    });

    it('shows full hierarchy', () => {
      expect(moduleHierarchy.names).to.equal('@folio/ui-module-b');
    });
  });
});
