import React from 'react';
import { useStripes } from '../../StripesContext';
import styles from './OrganizationLogo.css';

const OrganizationLogo = () => {
  const { branding } = useStripes();
  return (
    branding &&
      <div className={styles.logo}>
        <img
          alt={branding.logo.alt}
          src={branding.logo.src}
        />
      </div>
  );
};

export default OrganizationLogo;
