import { UnexpectedResourceError } from './Errors';
import {
  ResetTimer,
  configureRtr,
  isFolioApiRequest,
  resourceMapper,
  rotationHandler,
} from './token-util';

describe('isFolioApiRequest', () => {
  it('accepts requests whose origin matches okapi\'s', () => {
    const oUrl = 'https://millicent-sounds-kinda-like-malificent.edu';
    const req = `${oUrl}/that/is/awkward`;
    expect(isFolioApiRequest(req, oUrl)).toBe(true);
  });

  it('rejects requests whose origin does not match okapi\'s', () => {
    const req = 'https://skipper-seriously-skipper.org';
    expect(isFolioApiRequest(req, 'https://anything-but-skipper.edu')).toBe(false);
  });

  it('rejects invalid resource input', () => {
    const req = { 'ken': 'not kenough' };
    expect(isFolioApiRequest(req, 'https://sorry-dude.edu')).toBe(false);
  });
});

describe('resourceMapper', () => {
  const fx = (input) => (input);

  it('accepts strings', () => {
    const av = 'barbie';
    expect(resourceMapper(av, fx)).toBe(av);
  });

  it('accepts URLs', () => {
    const av = 'https://oppie.com';
    expect(resourceMapper(new URL(av), fx)).toBe(av);
  });

  it('accepts Requests', () => {
    const av = 'https://los-alamos-dreamtopia-castle-was-actually-a-nightmare.com/';
    expect(resourceMapper(new Request(av), fx)).toBe(av);
  });

  it('rejects other argument types', () => {
    const av = { ken: 'kenough' };
    try {
      resourceMapper(av, fx);
    } catch (e) {
      expect(e instanceof UnexpectedResourceError).toBe(true);
    }
  });
});

describe('configureRtr', () => {
  it('sets idleSessionTTL and idleModalTTL', () => {
    const res = configureRtr({});
    expect(res.idleSessionTTL).toBe('4h');
    expect(res.idleModalTTL).toBe('1m');
  });

  it('leaves existing settings in place', () => {
    const res = configureRtr({
      idleSessionTTL: '5m',
      idleModalTTL: '5m',
    });

    expect(res.idleSessionTTL).toBe('5m');
    expect(res.idleModalTTL).toBe('5m');
  });
});

describe('ResetTimer', () => {
  it('validates callback', () => {
    const t = () => {
      const rt = new ResetTimer('not a function');
    };
    expect(t).toThrow(TypeError);
  });

  describe('reset', () => {
    it('validates interval', () => {
      const t = () => {
        const rt = new ResetTimer(() => { });
        rt.reset('whoops');
      };
      expect(t).toThrow(TypeError);
    });

    it('calls callback', async () => {
      const callback = jest.fn();
      const rt = new ResetTimer(callback);
      rt.reset(1);
      await new Promise((res, _rej) => {
        setTimeout(res, 5);
      });
      expect(callback).toHaveBeenCalled();
    });

    it('resets existing timer', async () => {
      const callback = jest.fn();
      const logger = { log: jest.fn() };
      const rt = new ResetTimer(callback, logger);
      rt.reset(10);
      rt.reset(20);
      await new Promise((res, _rej) => {
        setTimeout(res, 100);
      });
      expect(callback).toHaveBeenCalled();
      // what jackass writes test that evaluate the logger for sideffects??
      // a jackass who wants 100% test coverage, that's who
      // 3 calls: 1 in the reset, 2 in the second
      expect(logger.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('cancel', () => {
    it('cancels callback', async () => {
      const callback = jest.fn();
      const logger = { log: jest.fn() };
      const rt = new ResetTimer(callback, logger);
      rt.reset(100);
      rt.cancel();
      await new Promise((res, _rej) => {
        setTimeout(res, 200);
      });
      expect(callback).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledTimes(2);
    });
  });
});

describe('rotationHandler', () => {
  const hst = jest.fn(async () => { });
  const tt = { reset: jest.fn() };
  const wt = { reset: jest.fn() };

  const rt = rotationHandler(hst, tt, wt, { fixedLengthSessionWarningTTL: 1 });

  it('calls dem callbacks', async () => {
    await rt({ accessTokenExpiration: 1, refreshTokenExpiration: 2 });
    expect(hst).toHaveBeenCalled();
    expect(tt.reset).toHaveBeenCalled();
    expect(wt.reset).toHaveBeenCalled();
  });
});
