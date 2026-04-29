import { rotateAndReplay } from './rotateAndReplay';
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

describe('FXHR', () => {
  let FakeXHR;
  let testXHR;
  beforeEach(() => {
    jest.clearAllMocks();
    FakeXHR = FXHR({ logger: { log: () => { } }, okapi: { url: 'okapiUrl' } });
    testXHR = new FakeXHR();
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

  it('Does not rotate if token is valid', () => {
    testXHR.addEventListener('abort', mockHandler);
    testXHR.open('POST', 'okapiUrl');
    testXHR.send(new ArrayBuffer(8));
    expect(openSpy.mock.calls).toHaveLength(1);
    expect(aelSpy.mock.calls).toHaveLength(1);
    expect(rotateAndReplay).not.toHaveBeenCalled();
  });

  it('onerror rotates and calls send when an error is received before any data is loaded', () => {
    console.log({ rotateAndReplay });
    testXHR.addEventListener('abort', mockHandler);
    testXHR.open('POST', 'okapiUrl');
    testXHR.send(new ArrayBuffer(8));
    testXHR.onerror({ loaded: 0 });
    expect(openSpy.mock.calls).toHaveLength(1);
    expect(aelSpy.mock.calls).toHaveLength(1);
    expect(rotateAndReplay).toHaveBeenCalled();
    // logging shows send() is called twice, but sendSpy only counts one call.
    // I don't understand that.
  });
});
