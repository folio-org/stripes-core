import { render, screen } from '@testing-library/react';
import { useQuery } from 'react-query';

import StaleBundleWarning from './StaleBundleWarning';

jest.mock('react-query', () => ({
  useQuery: jest.fn(),
}));

//
// I tried to write a more thorough test that leveraged a mock of ky
// in addition to mocking useQuery in order to test the logic inside
// queryFn, but jest and ky don't play nice because jest doesn't
// handle mocking of ESM modules well. <sigh>
//
// this means test coverage only gets to ~55%, but the important part
// (diffing the responses and showing an alert when the differ) _is_
// covered.
//
describe('StaleBundleWarning', () => {
  describe('mocked useQuery / config with "header"', () => {
    it('unequal responses render a refresh warning', async () => {
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

      expect(screen.getByText('stripes-core.stale.reload')).toBeInTheDocument();
    });

    it('equal responses renders nothing', async () => {
      const { rerender } = await render(<StaleBundleWarning />);

      expect(screen.queryByText('stripes-core.stale.reload')).toBeFalsy();

      rerender(<StaleBundleWarning />);

      expect(screen.queryByText('stripes-core.stale.reload')).toBeFalsy();
    });
  });
});
