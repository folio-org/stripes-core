import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { rtr } from '../Root/token-util';

import Harness from '../../../test/jest/helpers/harness';
import KeepWorkingModal from './KeepWorkingModal';

const emit = jest.fn();
const eventManagerMock = () => ({
  emit,
});

jest.mock('../Root/token-util');
jest.mock('../../loginServices', () => ({
  eventManager: eventManagerMock,
}));

describe('KeepWorkingModal', () => {
  it('renders with dates in the future', async () => {
    render(<Harness><KeepWorkingModal isVisible expiry={Date.now() + 10000} /></Harness>);

    screen.getByText('stripes-core.idle-session.modalHeader');
  });

  it('clicking "keep working" invokes rtr', async () => {
    render(<Harness><KeepWorkingModal isVisible expiry={Date.now() + 10000} /></Harness>);
    await userEvent.click(screen.getByRole('button'));
    expect(rtr).toHaveBeenCalled();
  });

  it('emits timeout event with dates in the past', async () => {
    render(<Harness><KeepWorkingModal isVisible expiry={Date.now() - 1000} /></Harness>);
    expect(emit).toHaveBeenCalled();
  });
});
