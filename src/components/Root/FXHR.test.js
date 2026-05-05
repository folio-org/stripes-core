import { rotateAndReplay } from './rotateAndReplay';
import { RTR_ERROR_EVENT } from './constants';
import { RTRError } from './Errors';
import FXHR from './FXHR';

jest.mock('./token-util', () => ({
  ...(jest.requireActual('./token-util')),
}));

jest.mock('./rotateAndReplay', () => ({
  ...(jest.requireActual('./rotateAndReplay')),
  rotateAndReplay: jest.fn(() => Promise.resolve()),
}));

const openSpy = jest.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation();
const sendSpy = jest.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => { });
const aelSpy = jest.spyOn(XMLHttpRequest.prototype, 'addEventListener').mockImplementation();

const mockHandler = jest.fn(() => { });

const setXhrState = (xhr, { readyState, status, responseText = '' }) => {
  Object.defineProperty(xhr, 'readyState', { configurable: true, value: readyState });
  Object.defineProperty(xhr, 'status', { configurable: true, value: status });
  Object.defineProperty(xhr, 'responseText', { configurable: true, value: responseText });
};

describe('FXHR', () => {
  let FakeXHR;
  let testXHR;
  let dispatchSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    FakeXHR = FXHR({ logger: { log: () => { } }, okapi: { url: 'okapiUrl' } });
    testXHR = new FakeXHR();
    dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    dispatchSpy.mockRestore();
  });

  it('instantiates without error', () => {
    expect(FakeXHR).toBeDefined;
    expect(testXHR).toBeDefined;
  });

  it('calls inherited open method', () => {
    testXHR.open('POST', 'okapiUrl');
    expect(openSpy.mock.calls).toHaveLength(1);
  });

  it('calls inherited send method', () => {
    testXHR.open('POST', 'notOkapi');
    testXHR.send(new ArrayBuffer(8));
    expect(openSpy.mock.calls).toHaveLength(1);
    expect(sendSpy.mock.calls).toHaveLength(1);
  });

  it('calls other prototype methods...', () => {
    testXHR.addEventListener('abort', mockHandler);
    testXHR.open('POST', 'okapiUrl');
    testXHR.send(new ArrayBuffer(8));
    expect(openSpy.mock.calls).toHaveLength(1);
    expect(aelSpy.mock.calls).toHaveLength(1);
  });

  it('does not rotate for successful requests', () => {
    testXHR.addEventListener('abort', mockHandler);
    testXHR.open('POST', 'okapiUrl/files');
    testXHR.onreadystatechange = mockHandler;
    testXHR.send(new ArrayBuffer(8));

    setXhrState(testXHR, { readyState: 4, status: 200, responseText: '{"ok":true}' });
    testXHR.handleInternalReadyStateChange({});

    expect(openSpy.mock.calls).toHaveLength(1);
    expect(aelSpy.mock.calls).toHaveLength(1);
    expect(rotateAndReplay).not.toHaveBeenCalled();
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('invokes onreadystatechange with xhr instance as callback context', () => {
    const contextHandler = jest.fn(function onReadyStateChange() {
      expect(this).toBe(testXHR);
    });

    testXHR.open('POST', 'okapiUrl/files');
    testXHR.onreadystatechange = contextHandler;
    testXHR.send(new ArrayBuffer(8));

    setXhrState(testXHR, { readyState: 4, status: 200, responseText: '{"ok":true}' });
    testXHR.handleInternalReadyStateChange({});

    expect(contextHandler).toHaveBeenCalledTimes(1);
  });

  it('intercepts first 401 done state, rotates, then replays once', async () => {
    testXHR.open('POST', 'okapiUrl/files');
    testXHR.withCredentials = true;
    testXHR.onreadystatechange = mockHandler;

    const payload = new ArrayBuffer(8);
    testXHR.send(payload);

    setXhrState(testXHR, { readyState: 4, status: 401, responseText: '{"errors":[]}' });
    testXHR.handleInternalReadyStateChange({});

    await Promise.resolve();

    expect(rotateAndReplay).toHaveBeenCalledTimes(1);
    expect(mockHandler).not.toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(sendSpy).toHaveBeenCalledTimes(2);

    setXhrState(testXHR, { readyState: 4, status: 200, responseText: '{"id":"ok"}' });
    testXHR.handleInternalReadyStateChange({});

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('treats okapi token-missing 400 as auth failure and rotates', async () => {
    testXHR.open('POST', 'okapiUrl/files');
    testXHR.onreadystatechange = mockHandler;
    testXHR.send(new ArrayBuffer(8));

    setXhrState(testXHR, {
      readyState: 4,
      status: 400,
      responseText: 'Token missing, access requires permission foo',
    });
    testXHR.handleInternalReadyStateChange({});

    await Promise.resolve();

    expect(rotateAndReplay).toHaveBeenCalledTimes(1);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('does not rotate twice when replayed request is still unauthorized', async () => {
    testXHR.open('POST', 'okapiUrl/files');
    testXHR.onreadystatechange = mockHandler;
    testXHR.send(new ArrayBuffer(8));

    setXhrState(testXHR, { readyState: 4, status: 401, responseText: '{}' });
    testXHR.handleInternalReadyStateChange({});

    await Promise.resolve();

    setXhrState(testXHR, { readyState: 4, status: 401, responseText: '{}' });
    testXHR.handleInternalReadyStateChange({});

    expect(rotateAndReplay).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('dispatches RTR_ERROR_EVENT and surfaces original failure when rotation fails', async () => {
    rotateAndReplay.mockRejectedValueOnce(new RTRError('Rotation failure!'));

    testXHR.open('POST', 'okapiUrl/files');
    testXHR.onreadystatechange = mockHandler;
    testXHR.send(new ArrayBuffer(8));

    setXhrState(testXHR, { readyState: 4, status: 401, responseText: '{}' });
    testXHR.handleInternalReadyStateChange({});

    await Promise.resolve();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy.mock.calls[0][0].type).toBe(RTR_ERROR_EVENT);
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
