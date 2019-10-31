/**
 * AppList tests
 */

import React from 'react';
import { beforeEach, it, describe } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../../helpers/setup-application';
import { mount } from '../../helpers/render-helpers';

import AppList from '../AppList';
import AppListInteractor from './interactor';

describe.only('AppList', () => {
  const appList = new AppListInteractor();

  setupApplication();

  beforeEach(async () => {
    await mount(
      <div></div>
    );
  });

  it('Someething', () => {
    expect(true).to.be.true;
  })
});
