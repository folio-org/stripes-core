import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { Icon } from '@folio/stripes-components';

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import { CurrentAppGroup } from './CurrentApp';
import ProfileDropdown from './ProfileDropdown';
import AppList from './AppList';
import { SkipLink } from './components';
import { useAppOrderContext } from './AppOrderProvider';
import { useStripes } from '../../StripesContext';

const MainNav = () => {
  const {
    apps,
  } = useAppOrderContext();
  const stripes = useStripes();
  const intl = useIntl();

  const [selectedApp, setSelectedApp] = useState(apps.find(entry => entry.active));
  const helpUrl = useRef(stripes.config.helpUrl ?? 'https://docs.folio.org').current;

  // This logic changes the visible current app at the starting side of the Main Navigation.
  useEffect(() => {
    setSelectedApp(apps.find(entry => entry.active));
  }, [apps]);

  return (
    <header className={css.navRoot} style={stripes.branding?.style?.mainNav ?? {}}>
      <div className={css.startSection}>
        <SkipLink />
        <CurrentAppGroup selectedApp={selectedApp} config={stripes.config} />
      </div>
      <nav aria-label={intl.formatMessage({ id: 'stripes-core.mainnav.topLevelLabel' })} className={css.endSection}>
        <AppList
          apps={apps}
          selectedApp={selectedApp}
          dropdownToggleId="app-list-dropdown-toggle"
        />
        <NavDivider md="hide" />
        <NavButton
          aria-label={intl.formatMessage({ id: 'stripes-core.help' })}
          data-test-item-help-button
          href={helpUrl}
          icon={<Icon
            icon="question-mark"
            size="large"
          />}
          id="helpButton"
          target="_blank"
        />
        <NavDivider md="hide" />
        <ProfileDropdown stripes={stripes} />
      </nav>
    </header>
  );
};

export default MainNav;
