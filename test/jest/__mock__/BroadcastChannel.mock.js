window.BroadcastChannel = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  close: jest.fn(),
  postMessage: jest.fn(),
  removeEventListener: jest.fn(),
}));
