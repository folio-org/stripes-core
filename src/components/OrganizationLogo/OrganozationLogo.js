import React from 'react';
import { branding } from 'stripes-config';
import styles from './OrganizationLogo.css';

const OrganizationLogo = () => {
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
