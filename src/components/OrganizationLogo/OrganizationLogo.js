import React, { useState, useEffect } from 'react';
import { getBranding } from '../../entitlementService';
import styles from './OrganizationLogo.css';

const OrganizationLogo = () => {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    getBranding()
      .then(brandingData => setBranding(brandingData))
      .catch(err => {
        console.warn('Failed to load branding data', err);
        setBranding(null);
      });
  }, []);
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
