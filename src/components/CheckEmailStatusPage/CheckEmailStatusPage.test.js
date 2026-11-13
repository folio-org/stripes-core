import { MemoryRouter } from 'react-router-dom';

import { act, render } from '@folio/jest-config-stripes/testing-library/react';

import CheckEmailStatusPage from './CheckEmailStatusPage';

jest.mock('../OrganizationLogo/OrganizationLogo', () => () => <div>OrganizationLogo</div>);

// the shared Headline mock drops props; forward them so aria attributes can be asserted.
jest.mock('@folio/stripes-components', () => ({
  Headline: ({ children, tag: Tag = 'div', size, weight, faded, ...rest }) => <Tag {...rest}>{children}</Tag>,
}));

const renderPage = (userEmail) => render(
  <MemoryRouter initialEntries={[{ pathname: '/check-email', state: { userEmail } }]}>
    <CheckEmailStatusPage />
  </MemoryRouter>
);

describe('CheckEmailStatusPage', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const getRegion = () => document.querySelector('[data-test-live-region]');
  const flushDelay = () => act(() => jest.runAllTimers());

  it('renders an empty live region first, then fills it', () => {
    renderPage('user@example.com');

    const region = getRegion();
    expect(region).toBeEmptyDOMElement();

    flushDelay();
    expect(region).toHaveTextContent('stripes-core.label.sent.email');
    expect(region).toHaveTextContent('stripes-core.label.caution.email');
  });

  it('renders the notification and caution inside one polite live region', () => {
    renderPage('user@example.com');
    flushDelay();

    const region = getRegion();
    expect(region).toHaveAttribute('aria-live', 'polite');
    // neither role=status (implies polite) nor aria-atomic (re-reads the region): either can double announcements
    expect(region).not.toHaveAttribute('aria-atomic');
    expect(document.querySelectorAll('[aria-live]')).toHaveLength(1);
    expect(region).not.toHaveAttribute('role');
    expect(region).toHaveTextContent('stripes-core.label.sent.email');
  });

  it('uses the generic message when the input is not an email', () => {
    renderPage('username');
    flushDelay();

    const region = getRegion();
    expect(region).toHaveTextContent('stripes-core.label.your.email');
  });
});
