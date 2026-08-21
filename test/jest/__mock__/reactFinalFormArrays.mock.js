import React from 'react';

jest.mock('react-final-form-arrays', () => {
  return {
    ...jest.requireActual('react-final-form-arrays'),

    FieldArray: () => <div>FieldArray</div>,
  };
});
