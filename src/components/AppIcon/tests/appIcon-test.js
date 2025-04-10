/**
 * AppIcon tests
 */

import React from 'react';
import { beforeEach, it, describe } from 'mocha';
import {
  HTML,
  Image,
  including
} from '@folio/stripes-testing';

import { mount } from '../../../../test/bigtest/helpers/render-helpers';

import AppIcon from '../AppIcon';
import png from './users-app-icon.png';
import svg from './users-app-icon.svg';

const AppIconInteractor = HTML.extend('AppIcon')
  .selector('[class^=appIcon]')
  .filters({
    hasImg: el => Boolean(el.querySelector('img')),
    tag: el => el.tagName.toLowerCase(),
    className: el => el.className,
    label: el => el.innerText
  });


describe('AppIcon', async () => {
  const appIcon = AppIconInteractor();
  const alt = 'My alt';
  const label = 'My label';
  const tag = 'div';
  const className = 'My className';

  const iconObject = {
    src: png,
    alt,
  };

  // This is a mock of the Stripes context that's available in an Folio app
  const stripesMock = {
    icons: {
      users: {
        app: {
          alt: 'Create, view and manage users',
          src: svg,
          high: {
            src: svg,
          },
          low: {
            src: png,
          }
        }
      }
    }
  };

  describe('Rendering an AppIcon using Stripes-context', () => {
    beforeEach(async () => {
      await mount(
        <AppIcon
          stripes={stripesMock}
          app="users"
          className={className}
        />
      );
    });

    it('Should render an <img>', () => appIcon.has({ hasImg: true }));

    it('Should render an img with an alt-attribute', () => Image({ alt: stripesMock.icons.users.app.alt }).exists());
  });

  describe('Rendering an AppIcon using an icon-object', () => {
    beforeEach(async () => {
      await mount(
        <AppIcon
          icon={iconObject}
          className={className}
        />
      );
    });

    it('Should render an <img>', () => appIcon.has({ hasImg: true }));

    it('Should render an img with an alt-attribute', () => Image({ alt }).exists());

    it(`Should render with a className of "${className}"`, () => appIcon.has({ className: including(className) }));
  });

  describe('Passing a string using the children-prop', () => {
    beforeEach(async () => {
      await mount(
        <AppIcon>
          {label}
        </AppIcon>
      );
    });

    it('Should render an AppIcon with a label', () => appIcon.has({ label }));
  });

  describe('Passing a string to the tag-prop', () => {
    beforeEach(async () => {
      await mount(
        <AppIcon
          tag={tag}
          icon={iconObject}
        />
      );
    });

    it(`Should render an AppIcon with a HTML tag of "${tag}"`, () => appIcon.has({ tag }));
  });

  const sizeTest = (size) => {
    describe(`Passing a size of "${size}"`, async () => {
      beforeEach(async () => {
        await mount(
          <AppIcon
            icon={iconObject}
            size={size}
          />
        );
      });

      it(`Should render an icon into a ${size}-sized container`, () => appIcon.has({ className: including(size) }));
    });
  };

  describe('Size tests', () => {
    sizeTest('small');
    sizeTest('medium');
    sizeTest('large');
  });
});
