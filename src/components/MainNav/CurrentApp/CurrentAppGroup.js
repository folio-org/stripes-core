import React from 'react';
import PropTypes from 'prop-types';
import { Headline } from '@folio/stripes-components';
import AppContextDropdown from './AppContextDropdown';
import { withAppCtxMenu } from './AppCtxMenuContext';
import AppIcon from '../../AppIcon';
import NavButton from '../NavButton';
import CurrentApp from './CurrentApp';
import css from './CurrentAppGroup.css';

const CurrentAppGroup = ({ displayDropdownButton, selectedApp }) => {
  if (displayDropdownButton) {
    return (
      <div className={css.currentAppGroupContainer}>
        <AppContextDropdown
          icon={<AppIcon alt="" app={selectedApp.displayName.toLowerCase()} icon={selectedApp.iconData} focusable={false} />}
        />
        <NavButton
          hideIcon
          className={css.currentAppGroupSegment}
          href={selectedApp.home}
          label={<Headline tag="h1" size="small" margin="none">{selectedApp.displayName}</Headline>}
        />
      </div>
    );
  }

  return (
    <CurrentApp
      id="ModuleMainHeading"
      currentApp={selectedApp}
    />
  );
};

CurrentAppGroup.propTypes = {
  displayDropdownButton: PropTypes.bool,
  selectedApp: PropTypes.shape(
    {
      displayName: PropTypes.string,
      home: PropTypes.string,
      iconData: PropTypes.object, // Only used by "Settings" since it's not a standalone app yet
      name: PropTypes.string,
      route: PropTypes.string,
    }
  ),
};

export default withAppCtxMenu(CurrentAppGroup);
