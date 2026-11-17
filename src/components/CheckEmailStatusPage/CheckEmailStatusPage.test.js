import { MemoryRouter } from 'react-router-dom';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import CheckEmailStatusPage from './CheckEmailStatusPage';

jest.mock('../OrganizationLogo/OrganizationLogo', () => () => <div>OrganizationLogo</div>);

jest.mock('@folio/stripes-components', () => ({
  Headline: ({ children, tag: Tag = 'div', size: _size, weight: _weight, faded: _faded, ...rest }) => <Tag {...rest}>{children}</Tag>,
}));

const renderPage = (userEmail) => render(
  <MemoryRouter initialEntries={[{ pathname: '/check-email', state: { userEmail } }]}>
    <CheckEmailStatusPage />
  </MemoryRouter>
);

describe('CheckEmailStatusPage', () => {
  const getStatusMessage = () => document.querySelector('[data-test-p-notification]').parentElement;

  it('moves focus to the container holding the notification and caution', () => {
    renderPage('user@example.com');

    const container = getStatusMessage();
    expect(container).toHaveFocus();
    expect(container).toHaveAttribute('tabindex', '-1');
    expect(container).toHaveTextContent('stripes-core.label.sent.email');
    expect(container).toHaveTextContent('stripes-core.label.caution.email');
  });

  it('suppresses the focus outline on the container', () => {
    renderPage('user@example.com');

    expect(getStatusMessage()).toHaveClass('statusMessage');
  });

  it('uses the generic message when the input is not an email', () => {
    renderPage('username');

    expect(getStatusMessage()).toHaveTextContent('stripes-core.label.your.email');
  });
});
