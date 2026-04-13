import { logRemoteDependencyViolations, formatManifestFetchFailure, formatDependencyMismatch } from './remoteDependencyValidation';

describe('remoteDependencyValidation', () => {
  let consoleWarnSpy;

  const defaultRemote = { name: 'folio_bulk_edit', assetPath: 'http://localhost:3000' };

  beforeEach(() => {
    global.fetch = jest.fn();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy.mockRestore();
  });

  describe('logRemoteDependencyViolations', () => {
    it('returns without error when remotes are missing, empty, or not an array', async () => {
      await expect(logRemoteDependencyViolations()).resolves.toBeUndefined();
      await expect(logRemoteDependencyViolations(undefined, [])).resolves.toBeUndefined();
      await expect(logRemoteDependencyViolations(undefined, { name: 'not-an-array' })).resolves.toBeUndefined();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('passes when all shared dependencies are semver-compatible', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          shared: [
            { name: 'react', version: '18.3.1', requiredVersion: '~18.3' },
            { name: 'react-router-dom', version: '5.3.4', requiredVersion: '^5.2.0' },
          ],
        }),
      });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('warns when a dependency version does not satisfy requiredVersion', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          shared: [
            { name: 'react', version: '18.3.1', requiredVersion: '^19.0.0' },
          ],
        }),
      });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(formatDependencyMismatch('folio_bulk_edit', 'react', '18.3.1', '^19.0.0')));
    });

    it('uses dependency id as fallback package name in mismatch warnings', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          shared: [
            { id: 'react-dom', version: '18.3.1', requiredVersion: '^19.0.0' },
          ],
        }),
      });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(formatDependencyMismatch('folio_bulk_edit', 'react-dom', '18.3.1', '^19.0.0')));
    });

    it('uses unknown-package fallback when dependency has no name or id', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          shared: [
            { version: '18.3.1', requiredVersion: '^19.0.0' },
          ],
        }),
      });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(formatDependencyMismatch('folio_bulk_edit', 'unknown-package', '18.3.1', '^19.0.0')));
    });

    it('ignores dependencies missing version or requiredVersion', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          shared: [
            { name: 'react', requiredVersion: '^18.0.0' },
            { name: 'react-dom', version: '18.3.1' },
          ],
        }),
      });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('treats non-array manifest shared field as empty', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          shared: { react: '18.3.1' },
        }),
      });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('warns when manifest cannot be fetched', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(formatManifestFetchFailure('folio_bulk_edit', 'http://localhost:3000/mf-manifest.json', 404)));
    });

    it('uses unknown-remote fallback in fetch failure warnings', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(logRemoteDependencyViolations(undefined, [{ assetPath: 'http://localhost:3000' }])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(formatManifestFetchFailure('unknown-remote', 'http://localhost:3000/mf-manifest.json', 500)));
    });

    it('warns with thrown error message when manifest request throws non-abort error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('network exploded'));

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[folio_bulk_edit] network exploded'));
    });

    it('returns without warning when fetch throws AbortError', async () => {
      global.fetch.mockRejectedValueOnce({ name: 'AbortError', message: 'aborted' });

      await expect(logRemoteDependencyViolations(undefined, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not warn if signal is aborted before warning stage', async () => {
      const signal = { aborted: false };

      global.fetch.mockImplementationOnce(() => {
        signal.aborted = true;
        return Promise.resolve({ ok: false, status: 404 });
      });

      await expect(logRemoteDependencyViolations(signal, [defaultRemote])).resolves.toBeUndefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('returns without error when aborted', async () => {
      const signal = { aborted: true };

      await expect(logRemoteDependencyViolations(signal, [defaultRemote])).resolves.toBeUndefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('aggregates multiple failures into a single warning message', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            shared: [
              { name: 'react', version: '18.3.1', requiredVersion: '^19.0.0' },
            ],
          }),
        });

      await expect(logRemoteDependencyViolations(undefined, [
        { name: 'remote_a', assetPath: 'http://localhost:3000' },
        { name: 'remote_b', assetPath: 'http://localhost:3001' },
      ])).resolves.toBeUndefined();

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const warning = consoleWarnSpy.mock.calls[0][0];
      expect(warning).toContain('Remote dependency validation failed:');
      expect(warning).toContain(`- ${formatManifestFetchFailure('remote_a', 'http://localhost:3000/mf-manifest.json', 404)}`);
      expect(warning).toContain(`- ${formatDependencyMismatch('remote_b', 'react', '18.3.1', '^19.0.0')}`);
    });
  });
});
