/**
 * ResizeContainer tests
 */
/* eslint-disable react/prop-types */
import React from 'react';
import times from 'lodash/times';
import { beforeEach, it, describe } from '@bigtest/mocha';
import { expect } from 'chai';
import { mount } from '../../../../../../../test/bigtest/helpers/render-helpers';

import ResizeContainer from '../ResizeContainer';
import ResizeContainerInteractor from './interactor';

// The width of each item
// These values would vary depending on the length of the label in a real app
const ITEM_WIDTH = 200;

// Normally we would want some offst to ensure that
// the visible items won't get too close to the current app in the nav bar
const ITEM_OFFSET = 0;

// The wrapper width defines the available space for the visible nav items
// This would be determined by the window width in a real app
const WRAPPER_WIDTH = 800;

const ITEMS = times(10).map(id => ({ id: id.toString() }));

// Since we have no offset and fixed wrapper/item width, we can predict the expected outcome
const EXPECTED_VISIBLE_ITEMS = WRAPPER_WIDTH / ITEM_WIDTH;
const EXPECTED_HIDDEN_ITEMS = ITEMS.length - EXPECTED_VISIBLE_ITEMS;

/**
 * A mock ResizeContainer component that mimics a real app example
 */
const ResizeContainerMock = ({ items, wrapperWidth, itemWidth, hideAllWidth, offset, withRTL }) => {
  return (
    <div dir={withRTL ? 'rtl' : 'ltr'}>
      <div style={{ maxWidth: wrapperWidth, backgroundColor: 'green', height: 100 }}>
        <ResizeContainer className="my-test-interactor" items={items} hideAllWidth={hideAllWidth} offset={offset}>
          {({ hiddenItems }) => (
            <div style={{ display: 'flex', flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
              {items.map(item => {
                const isHidden = hiddenItems.includes(item.id);

                return (
                  <span
                    {...{ [!isHidden ? 'data-test-resize-container-visible-item' : 'data-test-resize-container-hidden-item']: true }}
                    key={item.id}
                    style={{
                      flexShrink: 0,
                      height: 50,
                      visibility: !isHidden ? 'visible' : 'hidden'
                    }}
                  >
                    <button
                      id={`app-list-item-${item.id}`}
                      type="button"
                      style={{ width: itemWidth, backgroundColor: 'yellow' }}
                    >
                      {!isHidden ? `Visible Item ${item.id}` : 'Not visible'}
                    </button>
                  </span>
                );
              })}
            </div>
          )
        }
        </ResizeContainer>
      </div>
    </div>
  );
};

describe('ResizeContainer', () => {
  const resizeContainer = new ResizeContainerInteractor('.my-test-interactor');

  beforeEach(async () => {
    await mount(
      <ResizeContainerMock
        items={ITEMS}
        wrapperWidth={WRAPPER_WIDTH}
        itemWidth={ITEM_WIDTH}
        offset={ITEM_OFFSET}
        hideAllWidth={0} // Disabled
      />
    );
  });

  it(`renders ${EXPECTED_VISIBLE_ITEMS} visible items`, () => {
    expect(resizeContainer.visibleItems.length).to.equal(EXPECTED_VISIBLE_ITEMS);
  });

  it(`should have ${EXPECTED_HIDDEN_ITEMS} hidden items`, () => {
    expect(resizeContainer.hiddenItems.length).to.equal(EXPECTED_HIDDEN_ITEMS);
  });

  describe('If the value of the "hideAllWidth"-prop is larger than the width of the window', () => {
    beforeEach(async () => {
      await mount(
        <ResizeContainerMock
          items={ITEMS}
          wrapperWidth={WRAPPER_WIDTH}
          itemWidth={ITEM_WIDTH}
          offset={ITEM_OFFSET}
          hideAllWidth={9999999}
        />
      );
    });

    it('renders 0 visible items', () => {
      expect(resizeContainer.visibleItems.length).to.equal(0);
    });

    it(`renders ${ITEMS.length} hidden items (equal to all items)`, () => {
      expect(resizeContainer.hiddenItems.length).to.equal(ITEMS.length);
    });
  });

  describe('If rendered with right-to-left direction', () => {
    beforeEach(async () => {
      await mount(
        <ResizeContainerMock
          withRTL
          items={ITEMS}
          wrapperWidth={WRAPPER_WIDTH}
          itemWidth={ITEM_WIDTH}
          offset={ITEM_OFFSET}
          hideAllWidth={0} // Disabled
        />
      );
    });

    it(`renders ${EXPECTED_VISIBLE_ITEMS} visible items`, () => {
      expect(resizeContainer.visibleItems.length).to.equal(EXPECTED_VISIBLE_ITEMS);
    });

    it(`should have ${EXPECTED_HIDDEN_ITEMS} hidden items`, () => {
      expect(resizeContainer.hiddenItems.length).to.equal(EXPECTED_HIDDEN_ITEMS);
    });
  });
});
