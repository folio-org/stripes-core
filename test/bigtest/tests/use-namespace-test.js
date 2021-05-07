import React from 'react';
import PropTypes from 'prop-types';

import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-core-application';
import AppInteractor from '../interactors/app';

import useNamespace from '../../../src/hooks/useNamespace';
import Pluggable from '../../../src/Pluggable';
import NamespaceInteractor from '../interactors/Namespace';

const PrintNamespace = ({ options }) => {
  const namespace = useNamespace(options);

  return <div id="module-namespace">{namespace}</div>;
};

PrintNamespace.propTypes = {
  options: PropTypes.object,
};

const ModuleA = () => <Pluggable type="plugin-a" />;
const PluginA = () => <PrintNamespace />;

const ModuleB = () => <Pluggable type="plugin-b" />;
const PluginB = () => <PrintNamespace options={{ ignoreParents: true }} />;

const ModuleC = () => <PrintNamespace options={{ key: 'test-key' }} />;

describe('useNamespace', () => {
  const app = new AppInteractor();
  const namespace = new NamespaceInteractor();

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
        type: 'plugin',
        name: '@folio/plugin-a',
        displayName: 'plugin-a.title',
        pluginType: 'plugin-a',
        module: PluginA,
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
        name: '@folio/plugin-b',
        displayName: 'plugin-b.title',
        pluginType: 'plugin-b',
        module: PluginB,
      },
      {
        type: 'app',
        name: '@folio/ui-module-c',
        displayName: 'module-c.title',
        route: '/module-c',
        module: ModuleC,
      },
    ],
    translations: {
      'module-a.title': 'ModuleA',
      'module-b.title': 'ModuleB',
      'module-c.title': 'ModuleC',
      'plugin-a.title': 'PluginA',
      'plugin-b.title': 'PluginB',
    },
  });

  describe('Open app A with a plugin', () => {
    beforeEach(async () => {
      await app.nav('ModuleA').click();
    });

    it('shows full namespace', () => {
      expect(namespace.name).to.equal('@folio/ui-module-a:@folio/plugin-a');
    });
  });

  describe('open app B with a plugin ignoring parents', () => {
    beforeEach(async () => {
      await app.nav('ModuleB').click();
    });

    it('shows plugin namespace', () => {
      expect(namespace.name).to.equal('@folio/plugin-b');
    });
  });

  describe('open app C with a namespace key', () => {
    beforeEach(async () => {
      await app.nav('ModuleC').click();
    });

    it('shows module namespace with a key', () => {
      expect(namespace.name).to.equal('@folio/ui-module-c:test-key');
    });
  });
});
