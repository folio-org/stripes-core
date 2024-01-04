import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { FormattedMessage } from 'react-intl';

import AboutApplicationVersions from './AboutApplicationVersions';

describe('AboutApplicationVersions', () => {
  it('displays application version details', async () => {
    const applications = {
      a: {
        name: 'Albus',
        modules: [{ name: 'apple' }, { name: 'banana' }, { name: 'cherry' }]
      },
      b: {
        name: 'Beetlejuice',
        modules: [{ name: 'alpha' }, { name: 'barvo' }, { name: 'charlie' }]
      }

    };
    const id = 'All passing tests are alike; each failing test fails in its own way.';
    const message = <FormattedMessage id={id} />;

    render(<AboutApplicationVersions applications={applications} message={message} />);

    expect(screen.getByText(/about.applicationsVersionsTitle/)).toBeInTheDocument();
    expect(screen.getByText(id)).toBeInTheDocument();
    Object.keys(applications).forEach((i) => {
      expect(screen.getByText(applications[i].name)).toBeInTheDocument();
      applications[i].modules.forEach((j) => {
        expect(screen.getByText(j.name)).toBeInTheDocument();
      });
    });
  });
});
