import { handleEvent, invokeEventHandlers } from './handlerService';

describe('handleEvent', () => {
  it('does nothing in modules without handlers', () => {
    const e = {};
    const stripes = {};
    const module = {
      getModule: () => ({}),
    };
    const data = {};

    expect(handleEvent(e, stripes, module, data)).toBeNull();
  });


  it('calls module\'s handler when it is defined', () => {
    const e = {};
    const s = {};
    const module = {
      getModule: () => ({
        eventHandler: (ee, ss, dd) => ({ event: ee, stripes: ss, data: dd }),
      }),
      handlerName: 'eventHandler',
    };
    const d = {};

    const h = handleEvent(e, s, module, d);
    expect(h).toMatchObject({ event: e, stripes: s, data: d });
  });
});

describe('invokeEventHandlers', () => {
  it('invokes event handler on modules that contain them', () => {
    const e = {};
    const s = {
      connect: (component) => (component),
    };
    const d = {};

    const modules = [
      {
        getModule: () => ({
          eventHandler: (ee, ss, dd) => ({ event: ee, stripes: ss, data: dd }),
        }),
        handlerName: 'eventHandler',
      },
      {
        getModule: () => ({}),
      },
    ];

    const h = invokeEventHandlers(e, s, modules, d);
    expect(h.length).toEqual(1);
  });
});
