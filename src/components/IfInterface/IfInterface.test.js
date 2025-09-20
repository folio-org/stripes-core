import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import { useStripes } from '../../StripesContext';
import Stripes from '../../Stripes';
import IfInterface from './IfInterface';

jest.mock('../../StripesContext');
const stripes = new Stripes({
  discovery: {
    interfaces: {
      foo: '1.0'
    }
  },
  logger: {
    log: jest.fn(),
  }
});

// IfInterface is just a component version of Stripes::hasInterface
// See more extensive tests there.
describe('IfInterface', () => {
  it('returns true if interface is present', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfInterface name="foo">monkey</IfInterface>);
    expect(screen.queryByText(/monkey/)).toBeTruthy();
  });

  it('returns false if interface is absent', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfInterface name="paul,is,dead">monkey</IfInterface>);
    expect(screen.queryByText(/monkey/)).toBeFalsy();
  });

  it('handles async hasInterface result', async () => {
    const asyncStripes = new Stripes({
      store: {
        getState: jest.fn(),
        subscribe: jest.fn(),
        dispatch: jest.fn()
      },
      logger: {
        log: jest.fn(),
      }
    });
    
    // Mock hasInterface to return a Promise
    asyncStripes.hasInterface = jest.fn().mockResolvedValue(true);
    
    useStripes.mockReturnValue(asyncStripes);
    render(<IfInterface name="async-interface">async content</IfInterface>);
    
    // Initially should not show content while loading
    expect(screen.queryByText(/async content/)).toBeFalsy();
    
    // After Promise resolves, should show content
    await waitFor(() => {
      expect(screen.queryByText(/async content/)).toBeTruthy();
    });
  });

  it('handles async hasInterface failure gracefully', async () => {
    const asyncStripes = new Stripes({
      store: {
        getState: jest.fn(),
        subscribe: jest.fn(),
        dispatch: jest.fn()
      },
      logger: {
        log: jest.fn(),
      }
    });
    
    // Mock hasInterface to return a rejected Promise
    asyncStripes.hasInterface = jest.fn().mockRejectedValue(new Error('Discovery failed'));
    
    useStripes.mockReturnValue(asyncStripes);
    render(<IfInterface name="failing-interface">should not show</IfInterface>);
    
    // Should not show content after error
    await waitFor(() => {
      expect(screen.queryByText(/should not show/)).toBeFalsy();
    });
  });
});
