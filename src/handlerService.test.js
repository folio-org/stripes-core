import { getEventHandler, getEventHandlers } from './handlerService';

describe('getEventHandler', () => {
  it('does nothing in modules without handlers', () => {
    const e = {};
    const stripes = {};
    const module = {
      getModule: () => ({}),
    };
    const data = {};

    expect(getEventHandler(e, stripes, module, data)).toBeNull();
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

    const h = getEventHandler(e, s, module, d);
    expect(h).toMatchObject({ event: e, stripes: s, data: d });
  });
});

describe('getEventHandlers', () => {
  it('returns handlers from modules that contain them', () => {
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

    const h = getEventHandlers(e, s, modules, d);
    expect(h.length).toEqual(1);
  });
});
