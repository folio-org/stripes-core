import { validateRemoteDependencies, formatManifestFetchFailure, formatDependencyMismatch } from './remoteDependencyValidation';

describe('remoteDependencyValidation', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    global.fetch = jest.fn();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy.mockRestore();
  });

  describe('validateRemoteDependencies', () => {
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

      await expect(validateRemoteDependencies([
        { name: 'folio_bulk_edit', assetPath: 'http://localhost:3000' },
      ])).resolves.toBeUndefined();
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

      await expect(validateRemoteDependencies([
        { name: 'folio_bulk_edit', assetPath: 'http://localhost:3000' },
      ])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(formatDependencyMismatch('folio_bulk_edit', 'react', '18.3.1', '^19.0.0')));
    });

    it('warns when manifest cannot be fetched', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(validateRemoteDependencies([
        { name: 'folio_bulk_edit', assetPath: 'http://localhost:3000' },
      ])).resolves.toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(formatManifestFetchFailure('folio_bulk_edit', 'http://localhost:3000/mf-manifest.json', 404)));
    });

    it('returns without error when aborted', async () => {
      const signal = { aborted: true };

      await expect(validateRemoteDependencies([
        { name: 'folio_bulk_edit', assetPath: 'http://localhost:3000' },
      ], signal)).resolves.toBeUndefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
