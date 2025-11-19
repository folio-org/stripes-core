import { createRef, forwardRef, act } from 'react';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import ResizeContainer from './ResizeContainer';

const makeItems = (n) => Array.from({ length: n }, (_, i) => ({ id: String(i + 1) }));

const FIXED_ITEM_WIDTH = 120;
const WRAPPER_WIDTH = 500;

const Component = forwardRef(({
  items,
  currentAppId,
  hideAllWidth,
  offset,
  className,
}, ref) => (
  <div
    data-testid="outer"
    style={{ width: WRAPPER_WIDTH }}
  >
    <ResizeContainer
      ref={ref}
      items={items}
      currentAppId={currentAppId}
      hideAllWidth={hideAllWidth}
      offset={offset}
      className={className}
    >
      {({ hiddenItems, itemWidths, ready }) => (
        <div
          data-testid="payload"
          data-hidden-items={hiddenItems.join(',')}
          data-ready={ready}
        >
          {items.map(item => (
            <span key={item.id}>
              <button
                id={`app-list-item-${item.id}`}
                type="button"
              >
                Item {item.id} ({itemWidths[item.id] || 0})
              </button>
            </span>
          ))}
        </div>
      )}
    </ResizeContainer>
  </div>
));

const getComponent = (props = {}) => <Component {...props} />;
const renderComponent = (props = {}) => render(getComponent(props));

let originalOffsetWidth;
let originalClientWidth;

describe('ResizeContainer (Jest)', () => {
  beforeEach(() => {
    originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get() { return FIXED_ITEM_WIDTH; } });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return WRAPPER_WIDTH; } });

    jest.useFakeTimers();
  });

  afterEach(() => {
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    }
    if (originalClientWidth) {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth);
    }
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('sets ready after initialization when items exist', () => {
    const items = makeItems(3);

    const { getByTestId } = renderComponent({
      items,
      offset: 0,
      hideAllWidth: 0,
    });
    const payload = getByTestId('payload');

    expect(payload.getAttribute('data-ready')).toBe('true');
  });

  it('does not set ready when there are no initial items', () => {
    const { getByTestId } = renderComponent({
      items: [],
      offset: 0,
      hideAllWidth: 0,
    });

    const payload = getByTestId('payload');

    expect(payload.getAttribute('data-ready')).toBe('false');
  });

  it('hides items that exceed wrapper width accounting for offset', () => {
    const items = makeItems(10);
    const offset = 50;

    const { getByTestId } = renderComponent({
      items,
      offset,
      hideAllWidth: 0,
    });

    const payload = getByTestId('payload');
    const hidden = payload.getAttribute('data-hidden-items').split(',').filter(Boolean);

    // capacity calculation: accumulate widths until width + item + offset would exceed wrapper
    let acc = 0;
    const hiddenCalc = [];

    items.forEach(it => {
      const fits = (FIXED_ITEM_WIDTH + acc + offset) <= WRAPPER_WIDTH;

      if (!fits) {
        hiddenCalc.push(it.id);
      } else {
        acc += FIXED_ITEM_WIDTH;
      }
    });

    expect(hidden).toEqual(hiddenCalc);
  });

  it('hides all items when window.innerWidth <= hideAllWidth', () => {
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 300 });
    const items = makeItems(4);

    const { getByTestId } = renderComponent({
      items,
      hideAllWidth: 400,
      offset: 0,
    });

    const payload = getByTestId('payload');
    const hidden = payload.getAttribute('data-hidden-items').split(',').filter(Boolean);

    expect(hidden).toEqual(items.map(i => i.id));

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: original });
  });

  it('re-caches widths only when item ids set changes', () => {
    const items1 = makeItems(3);
    const ref = createRef();

    const { rerender } = renderComponent({
      ref,
      items: items1,
      hideAllWidth: 0,
      offset: 0,
    });

    // Spy after initial mount so we only count subsequent calls
    const cacheSpy = jest.spyOn(ref.current, 'cacheWidthsOfItems');
    const itemsSameIds = items1.map(i => ({ id: i.id, foo: 'bar' }));

    rerender(getComponent({
      ref,
      items: itemsSameIds,
      hideAllWidth: 0,
      offset: 0,
    }));

    expect(cacheSpy).not.toHaveBeenCalled();

    const itemsNew = [...itemsSameIds, { id: '999' }];

    act(() => {
      rerender(getComponent({
        ref,
        items: itemsNew,
        hideAllWidth: 0,
        offset: 0,
      }));
    });

    // Flush all pending promises and timers (includes requestAnimationFrame)
    act(() => {
      jest.runAllTimers();
    });

    expect(cacheSpy).toHaveBeenCalledTimes(1);
  });

  it('does not re-caches widths when only items order changes', () => {
    const items1 = makeItems(3);
    const ref = createRef();
    const props = {
      ref,
      items: items1,
      hideAllWidth: 0,
      offset: 0,
    };

    const { rerender } = renderComponent(props);

    // Spy after initial mount so we only count subsequent calls
    const cacheSpy = jest.spyOn(ref.current, 'cacheWidthsOfItems');

    rerender(getComponent({
      ...props,
      items: items1.toReversed(),
    }));

    expect(cacheSpy).not.toHaveBeenCalled();
  });

  it('updates hidden items when currentAppId changes', () => {
    const items = makeItems(4);
    const ref = createRef();

    const { rerender } = renderComponent({
      ref,
      items,
      currentAppId: '1',
      hideAllWidth: 0,
      offset: 0,
    });

    const updateSpy = jest.spyOn(ref.current, 'updateHiddenItems');

    rerender(getComponent({
      ref,
      items,
      currentAppId: '2',
      hideAllWidth: 0,
      offset: 0,
    }));

    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('debounces resize events and calls updateHiddenItems once', () => {
    const items = makeItems(5);
    const ref = createRef();

    renderComponent({
      ref,
      items,
      hideAllWidth: 0,
      offset: 0,
    });

    const updateSpy = jest.spyOn(ref.current, 'updateHiddenItems');

    act(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
    });

    expect(updateSpy).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(150); });
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes itemWidths for each item id', () => {
    const items = makeItems(2);

    const { getByText } = renderComponent({
      items,
      hideAllWidth: 0,
      offset: 0,
    });

    items.forEach(i => {
      expect(getByText(new RegExp(`Item ${i.id} \\(${FIXED_ITEM_WIDTH}\\)`))).toBeTruthy();
    });
  });

  describe('when items change', () => {
    it('should clear cache and show all items before measuring', () => {
      const items1 = makeItems(5);
      const ref = createRef();
      let hiddenItemsWhenMeasuring = null;
      let cacheBeforeMeasuring = null;

      const { rerender } = renderComponent({
        ref,
        items: items1,
        hideAllWidth: 0,
        offset: 0,
      });

      // Initial: item 5 is hidden, cache has items 1-5
      expect(ref.current.state.hiddenItems).toEqual(['5']);
      expect(ref.current.cachedItemWidths).toEqual({
        '1': 120, '2': 120, '3': 120, '4': 120, '5': 120
      });

      // Spy on cacheWidthsOfItems to capture state and cache when it's called
      const originalCache = ref.current.cacheWidthsOfItems;
      ref.current.cacheWidthsOfItems = function(...args) {
        hiddenItemsWhenMeasuring = [...this.state.hiddenItems];
        cacheBeforeMeasuring = { ...this.cachedItemWidths };

        return originalCache.apply(this, args);
      };

      const items2 = [...items1, { id: '6' }];

      act(() => {
        rerender(getComponent({
          ref,
          items: items2,
          hideAllWidth: 0,
          offset: 0,
        }));
      });

      act(() => {
        jest.runAllTimers();
      });
      
      expect(cacheBeforeMeasuring).toEqual({});
      expect(hiddenItemsWhenMeasuring).toEqual([]);
    });
  });
});
