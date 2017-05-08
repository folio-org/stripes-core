import React from 'react';
import Link from 'react-router-dom/Link';

export const Front = () => (
  <div>
    <h3>Welcome to whatever this is!</h3>
    <p><Link to="/about">About</Link></p>
  </div>
);
export default Front;
