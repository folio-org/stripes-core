import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import AboutModules from './AboutModules';

describe('AboutModules', () => {
  it('displays application version details', async () => {
    const list = [
      { name: 'Abigail', interfaces: [{ name: 'iAnnabeth' }, { name: 'iAlice' }] },
      { name: 'Betsy', interfaces: [{ name: 'iBelle' }, { name: 'iBrea' }] },
    ];

    render(<AboutModules list={list} />);

    Object.keys(list).forEach((i) => {
      expect(screen.getByText(list[i].name)).toBeInTheDocument();
      list[i].interfaces.forEach((j) => {
        expect(screen.getByText(j.name)).toBeInTheDocument();
      });
    });
  });
});
