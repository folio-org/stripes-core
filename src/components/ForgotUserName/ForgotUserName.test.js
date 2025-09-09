import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { userEvent } from '@folio/jest-config-stripes/testing-library/user-event';

import ForgotUserNameForm from './ForgotUserNameForm';
import ForgotUserName from './ForgotUserName';
import useWhoopsForgot from './useWhoopsForgot';
import { defaultErrors } from '../../constants';

jest.mock('../../StripesContext', () => ({
  useStripes: () => ({
    store: { dispatch: jest.fn() },
    okapi: { tenant: 'bertha' },
    config: {
      tenantOptions: {
        bertha: { name: 'bertha', displayName: 'Big Bertha' },
      }
    }
  })
}));

jest.mock('../OrganizationLogo', () => () => 'OrganizationLogo');
jest.mock('../AuthErrorsContainer', () => ({ errors = [] }) => errors[0]?.code);
jest.mock('react-router-dom', () => ({
  Redirect: () => '<Redirect />',
}));

// PreLoginLanding tests don't handle button.disabled
// and I don't feel like expanding this PR even further
jest.mock('@folio/stripes-components', () => ({
  ...jest.requireActual('@folio/stripes-components'),
  Button: jest.fn(({ children, disabled, onClick = jest.fn() }) => {
    return (
      <button data-test-button onClick={onClick} disabled={disabled} type="submit">
        <span>
          {children}
        </span>
      </button>
    );
  }),
}));

jest.mock('./useWhoopsForgot');

describe('ForgotUserNameForm', () => {
  it('displays headline, input field, submit button', () => {
    render(<ForgotUserNameForm onSubmit={jest.fn()} isValid />);

    expect(screen.getByText('stripes-core.label.forgotUsername'));
    expect(screen.getByText('stripes-core.placeholder.forgotUsername'));
    expect(screen.getByText('stripes-core.button.continue'));
  });

  it('enables submit conditionally', async () => {
    const user = userEvent.setup();
    render(<ForgotUserNameForm onSubmit={jest.fn()} isValid />);
    const submit = screen.getByRole('button');

    expect(submit).toHaveProperty('disabled', true);
    await user.type(screen.getByRole('textbox'), 'asdf');
    await waitFor(() => {
      expect(submit).not.toHaveProperty('disabled', true);
    });
  });

  it('passes errors through to AuthErrorsContainer', () => {
    const errors = [
      { message: 'this is an error message!', code: 'code', type: 'type' }
    ];

    render(<ForgotUserNameForm errors={errors} onSubmit={jest.fn()} isValid />);
    expect(screen.getByText(errors[0].code));
  });

  it('calls onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const userInput = 'some-username';

    render(<ForgotUserNameForm onSubmit={onSubmit} isValid />);
    const submit = screen.getByRole('button');

    await user.type(screen.getByRole('textbox'), userInput);
    await waitFor(() => {
      expect(submit).not.toHaveProperty('disabled', true);
    });
    await user.click(submit);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});

describe('ForgotUserName', () => {
  it('handles success', async () => {
    const user = userEvent.setup();
    const userInput = 'some-username@some-school.edu';

    const mockUseWhoopsForgot = useWhoopsForgot;
    mockUseWhoopsForgot.mockReturnValue({
      mutateAsync: jest.fn(() => Promise.resolve()),
    });

    render(<ForgotUserName />);
    const submit = screen.getByRole('button');

    await user.type(screen.getByRole('textbox'), userInput);
    await waitFor(() => {
      expect(submit).not.toHaveProperty('disabled', true);
    });
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByText('<Redirect />'));
    });
  });

  it('handles failure', async () => {
    const user = userEvent.setup();
    const userInput = 'some-username@some-school.edu';

    const mockUseWhoopsForgot = useWhoopsForgot;
    mockUseWhoopsForgot.mockReturnValue({
      mutateAsync: () => Promise.reject({ // eslint-disable-line prefer-promise-reject-errors
        response: {
          json: () => Promise.resolve({
            errorMessage: 'some error',
          }),
          status: 400,
        }
      }),
    });

    render(<ForgotUserName />);
    const submit = screen.getByRole('button');

    await user.type(screen.getByRole('textbox'), userInput);
    await waitFor(() => {
      expect(submit).not.toHaveProperty('disabled', true);
    });
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByText(defaultErrors.FORGOTTEN_USERNAME_CLIENT_ERROR.code));
    });
  });
});
