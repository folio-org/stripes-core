import React from 'react';

jest.mock('@folio/stripes-components/lib/Icon', () => {
  return () => <span>Icon</span>;
});
