import React from 'react';

jest.mock('react-final-form-listeners', () => {
  return {
    ...jest.requireActual('react-final-form-listeners'),

    OnChange: jest.fn(({ children }) => <>{children()}</>),
  };
});
