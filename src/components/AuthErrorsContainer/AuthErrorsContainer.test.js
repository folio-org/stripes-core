import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import AuthErrorsContainer from './AuthErrorsContainer';

describe('AuthErrorsContainer', () => {
  it('displays errors', async () => {
    const errors = [
      {
        code: 'monkey',
        translationNamespace: 'test'
      },
    ];
    await render(<AuthErrorsContainer errors={errors} />);
    screen.getByText(`${errors[0].translationNamespace}.${errors[0].code}`);
  });

  it('provides default translation namespace', async () => {
    const errors = [
      {
        code: 'code',
        type: 'type',
      },
    ];
    await render(<AuthErrorsContainer errors={errors} />);
    screen.getByText(`stripes-core.errors.${errors[0].code}`);
  });
});
