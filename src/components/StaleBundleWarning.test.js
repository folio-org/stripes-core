import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useQuery } from 'react-query';

import StaleBundleWarning, { queryFn } from './StaleBundleWarning';

jest.mock('react-query', () => ({
  useQuery: jest.fn(),
}));

describe('StaleBundleWarning', () => {
  describe('unequal responses render a refresh warning', () => {
    beforeEach(async () => {
      delete window.location;
      window.location = { reload: jest.fn() };

      const mockUseQuery = useQuery;
      mockUseQuery.mockReturnValue({
        data: 'foo',
      });

      const { rerender } = await render(<StaleBundleWarning />);

      expect(screen.queryByText('stripes-core.stale.reload')).toBeFalsy();

      mockUseQuery.mockReturnValue({
        data: 'bar',
      });

      rerender(<StaleBundleWarning />);
    });

    it('warning is present', async () => {
      expect(screen.getByText('stripes-core.stale.reload')).toBeInTheDocument();
    });

    it('clicking warning button calls reload', async () => {
      await userEvent.click(screen.getByRole('button'));
      expect(window.location.reload).toHaveBeenCalledWith(true);
    });
  });

  it('equal responses render nothing', async () => {
    const { rerender } = await render(<StaleBundleWarning />);

    expect(screen.queryByText('stripes-core.stale.reload')).toBeFalsy();

    rerender(<StaleBundleWarning />);

    expect(screen.queryByText('stripes-core.stale.reload')).toBeFalsy();
  });

  it('query returns null if config is absent', async () => {
    const config = {};
    const value = await queryFn(config, {});
    expect(value).toBeNull();
  });

  it('query reads request body', async () => {
    const config = {
      path: 'index.html',
    };

    const kyImpl = {
      get: () => ({
        text: () => Promise.resolve('monkey')
      }),
    };

    const value = await queryFn(config, kyImpl);
    expect(value).toEqual('monkey');
  });

  it('query reads request header', async () => {
    const config = {
      path: 'index.html',
      header: 'monkey',
    };

    const kyImpl = jest.fn(async () => ({
      headers: {
        get: () => config.header,
      }
    }));

    const value = await queryFn(config, kyImpl);
    expect(value).toEqual('monkey');
  });

  it('query swallows errors but warns about them', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
    const config = {
      path: 'index.html',
    };

    const reject = 'monkey';
    const kyImpl = {
      get: () => ({
        text: () => Promise.reject(reject) // eslint-disable-line prefer-promise-reject-errors
      }),
    };

    const value = await queryFn(config, kyImpl);
    expect(value).toBeNull();
    expect(warn).toHaveBeenCalledWith(`Error checking for new bundle ${reject}`);
  });
});
