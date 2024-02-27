window.BroadcastChannel = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  postMessage: jest.fn(),
  close: jest.fn(),
}));
