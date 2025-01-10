import { isStorageEnabled } from './App';

const storageMock = () => ({
  getItem: () => {
    throw new Error();
  },
});

describe('isStorageEnabled', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true when all storage options are enabled', () => {
    expect(isStorageEnabled()).toBeTrue;
  });

  describe('returns false when any storage option is disabled', () => {
    it('handles local storage', () => {
      Object.defineProperty(window, 'localStorage', { value: storageMock });
      const isEnabled = isStorageEnabled();
      expect(isEnabled).toBeFalse;
    });
    it('handles session storage', () => {
      Object.defineProperty(window, 'sessionStorage', { value: storageMock });
      const isEnabled = isStorageEnabled();
      expect(isEnabled).toBeFalse;
    });

    it('handles cookies', () => {
      jest.spyOn(navigator, 'cookieEnabled', 'get').mockReturnValue(false);
      const isEnabled = isStorageEnabled();
      expect(isEnabled).toBeFalse;
    });
  });
});
