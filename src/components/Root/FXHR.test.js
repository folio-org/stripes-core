// import { rtr } from './token-util';
import { rotateAndReplay } from './rotateAndReplay';
import { getTokenExpiry } from '../../loginServices';
import FXHR from './FXHR';

jest.mock('./token-util', () => ({
  ...(jest.requireActual('./token-util')),
}));

jest.mock('./rotateAndReplay', () => ({
  ...(jest.requireActual('./rotateAndReplay')),
  rotateAndReplay: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../loginServices', () => ({
  ...(jest.requireActual('../../loginServices')),
  setTokenExpiry: jest.fn(() => Promise.resolve()),
  getTokenExpiry: jest.fn(() => Promise.resolve())
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
    FakeXHR = FXHR({ tokenExpiration: { atExpires: Date.now(), rtExpires: Date.now() + 5000 }, logger: { log: () => { } }, okapi: { url: 'okapiUrl' } });
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
    getTokenExpiry.mockResolvedValue({
      atExpires: Date.now() + (10 * 60 * 1000),
      rtExpires: Date.now() + (10 * 60 * 1000),
    });

    testXHR.addEventListener('abort', mockHandler);
    testXHR.open('POST', 'okapiUrl');
    testXHR.send(new ArrayBuffer(8));
    expect(openSpy.mock.calls).toHaveLength(1);
    expect(aelSpy.mock.calls).toHaveLength(1);
    expect(rotateAndReplay).not.toHaveBeenCalled();
  });

  it('Rotates if token is expired', async () => {
    getTokenExpiry.mockResolvedValue({
      atExpires: Date.now() - (10 * 60 * 1000),
      rtExpires: Date.now() + (10 * 60 * 1000),
    });
    console.log({ rotateAndReplay });
    testXHR.addEventListener('abort', mockHandler);
    testXHR.open('POST', 'okapiUrl');
    await testXHR.send(new ArrayBuffer(8));
    expect(openSpy.mock.calls).toHaveLength(1);
    expect(aelSpy.mock.calls).toHaveLength(1);
    expect(rotateAndReplay).toHaveBeenCalled();
  });
});
