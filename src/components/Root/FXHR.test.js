import { rtr } from './token-util';
import { getTokenExpiry } from '../../loginServices';
import FXHR from './FXHR';

jest.mock('./token-util', () => ({
  ...(jest.requireActual('./token-util')),
  rtr: jest.fn(() => new Promise()),
}));

jest.mock('../../loginServices', () => ({
  ...(jest.requireActual('../../loginServices')),
  setTokenExpiry: jest.fn(() => Promise.resolve()),
  getTokenExpiry: jest.fn(() => Promise.resolve())
}));

const openSpy = jest.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation();
const sendSpy = jest.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => {});
const aelSpy = jest.spyOn(XMLHttpRequest.prototype, 'addEventListener').mockImplementation();

const mockHandler = jest.fn(() => {});

describe('FXHR', () => {
  let FakeXHR;
  let testXHR;
  beforeEach(() => {
    jest.clearAllMocks();
    FakeXHR = FXHR({ tokenExpiration: { atExpires: Date.now(), rtExpires: Date.now() + 5000 }, logger: { log: () => {} }, okapi:{ url:'okapiUrl' } });
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
    rtr.mockResolvedValue();
    testXHR.open('POST', 'notOkapi');
    testXHR.send(new ArrayBuffer(8));
    expect(openSpy.mock.calls).toHaveLength(1);
    expect(sendSpy.mock.calls).toHaveLength(1);
  });

  it('calls other prototype methods...', () => {
    rtr.mockResolvedValue();
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
    expect(rtr.mock.calls).toHaveLength(0);
  });
});
