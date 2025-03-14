import React from 'react';
import PropTypes from 'prop-types';

import { describe, beforeEach, it } from 'mocha';
import {
  HTML
} from '@folio/stripes-testing';

import {
  AppListInteractor
} from '../interactors/app';
import setupApplication from '../helpers/setup-core-application';

import { useNamespace, withNamespace } from '../../../src/components';
import Pluggable from '../../../src/Pluggable';

const NamespaceInteractor = HTML.extend('Namespace')
  .selector('#module-namespace')
  .filters({
    name: el => el.innerText
  });

const PrintNamespace = ({ options }) => {
  const [namespace] = useNamespace(options);

  return <div id="module-namespace">{namespace}</div>;
};

PrintNamespace.propTypes = {
  options: PropTypes.object,
};

const WrappedComponent = ({ namespace }) => <div id="module-namespace">{namespace}</div>;

WrappedComponent.propTypes = {
  namespace: PropTypes.string,
};

const WrappedWithNamespace = withNamespace(WrappedComponent, { key: 'with-namespace' });

const PrintViaGetNamespace = () => {
  const [, getNamepace] = useNamespace();

  return <div id="module-namespace">{getNamepace({ key: 'test-key-2' })}</div>;
};

const ModuleA = () => <Pluggable type="plugin-a" />;
const PluginA = () => <PrintNamespace />;

const ModuleB = () => <Pluggable type="plugin-b" />;
const PluginB = () => <PrintNamespace options={{ ignoreParents: true }} />;

const ModuleC = () => <PrintNamespace options={{ key: 'test-key' }} />;

const ModuleD = () => <PrintViaGetNamespace />;
const ModuleE = () => <WrappedWithNamespace />;

describe('Namespace', () => {
  const nav = AppListInteractor();
  const namespace = NamespaceInteractor();

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
      {
        type: 'app',
        name: '@folio/ui-module-d',
        displayName: 'module-d.title',
        route: '/module-d',
        module: ModuleD,
      },
      {
        type: 'app',
        name: '@folio/ui-module-e',
        displayName: 'module-e.title',
        route: '/module-e',
        module: ModuleE,
      }
    ],
    translations: {
      'module-a.title': 'ModuleA',
      'module-b.title': 'ModuleB',
      'module-c.title': 'ModuleC',
      'module-d.title': 'ModuleD',
      'module-e.title': 'ModuleE',
      'plugin-a.title': 'PluginA',
      'plugin-b.title': 'PluginB',
    },
  });

  describe('Open app A with a plugin', () => {
    beforeEach(async () => {
      await nav.choose('ModuleA');
    });

    it('shows full namespace', () => namespace.has({ name: '@folio/ui-module-a:@folio/plugin-a' }));
  });

  describe('open app B with a plugin ignoring parents', () => {
    beforeEach(async () => {
      await nav.choose('ModuleB');
    });

    it('shows plugin namespace', () => namespace.has({ name: '@folio/plugin-b' }));
  });

  describe('open app C with a namespace key', () => {
    beforeEach(async () => {
      await nav.choose('ModuleC');
    });

    it('shows module namespace with a key', () => namespace.has({ name: '@folio/ui-module-c:test-key' }));
  });

  describe('open app D', () => {
    beforeEach(async () => {
      await nav.choose('ModuleD');
    });

    it('shows module namespace with a key', () => namespace.has({ name: '@folio/ui-module-d:test-key-2' }));
  });

  describe('open app E wrapped in a withNamespace HOC', () => {
    beforeEach(async () => {
      await nav.choose('ModuleE');
    });

    it('shows module namespace with a key via props', () => namespace.has({ name: '@folio/ui-module-e:with-namespace' }));
  });
});
