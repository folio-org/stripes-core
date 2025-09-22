import { waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { getTokenExpiry } from '../../loginServices';
import * as TokenUtil from './token-util';
import { FFetch } from './FFetch';

jest.mock('../../loginServices', () => ({
  ...(jest.requireActual('../../loginServices')),
  setTokenExpiry: jest.fn(() => Promise.resolve()),
  getTokenExpiry: jest.fn(() => Promise.resolve())
}));

const mockBroadcastChannel = {
  postMessage: jest.fn(),
  onmessage: null,
  close: jest.fn(),
  addEventListener: jest.fn((event, callback) => {
    if (event === 'message') {
      mockBroadcastChannel.onmessage = callback;
    }
  }),
  removeEventListener: jest.fn(),
};

const log = jest.fn();

describe('RTR - active window messaging', () => {
  let testFfetch;
  let rtrSpy;
  beforeEach(() => {
    global.BroadcastChannel = jest.fn(() => mockBroadcastChannel);
    rtrSpy = jest.spyOn(TokenUtil, 'rtr');
    rtrSpy.mockImplementation(() => { console.log('rtr called'); Promise.resolve(); });
    testFfetch = new FFetch({
      logger: { log },
      okapi: {
        url: 'okapiUrl',
        tenant: 'okapiTenant',
      },
      store: {
        getState: () => ({
          okapi: {}
        })
      }
    });
    rtrSpy.mockClear();
  });

  it('sends a message when setActiveWindow is called', async () => {
    getTokenExpiry.mockResolvedValue({
      atExpires: Date.now() - (10 * 60 * 1000),
      rtExpires: Date.now() - (10 * 60 * 1000),
    });
    const windowId = window.stripesRTRWindowId;
    testFfetch.documentFocusHandler();
    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
      type: '@folio/stripes/core::activeWindowMessage',
      activeWindow: windowId,
    });
  });

  // await waitFor(() => expect(rtrSpy).toHaveBeenCalledTimes(1));
  it('rotates if token expired', async () => {
    getTokenExpiry.mockResolvedValue({
      atExpires: Date.now() - (10 * 60 * 1000),
      rtExpires: Date.now() - (10 * 60 * 1000),
    });
    testFfetch.replaceFetch();
    testFfetch.replaceXMLHttpRequest();
    testFfetch.documentFocusHandler();
    await waitFor(() => expect(rtrSpy).toHaveBeenCalledTimes(1));
  });

  it('focusHandler does NOT rotate if token is still valid', async () => {
    getTokenExpiry.mockResolvedValue({
      atExpires: Date.now() + (10 * 60 * 1000),
      rtExpires: Date.now() + (10 * 60 * 1000),
    });
    testFfetch.documentFocusHandler();
    expect(rtrSpy).toHaveBeenCalledTimes(0);
  });

  it('handles messages from other windows', async () => {
    const windowId = 'test-window-id';
    mockBroadcastChannel.onmessage({ data: { type: '@folio/stripes/core::activeWindowMessage', activeWindow: windowId } });

    expect(sessionStorage.getItem('@folio/stripes/core::activeWindowId')).toEqual(windowId);
  });
});
