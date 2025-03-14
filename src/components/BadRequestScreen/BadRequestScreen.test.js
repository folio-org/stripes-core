import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import BadRequestScreen from './BadRequestScreen';

jest.mock('../../Pluggable', () => (props) => props.children);

describe('BadRequestScreen', () => {
  it('renders expected message', () => {
    render(<BadRequestScreen />);

    screen.getByText('stripes-core.front.error.header');
    screen.getByText(/stripes-core.front.error.general.message/);
  });
});


