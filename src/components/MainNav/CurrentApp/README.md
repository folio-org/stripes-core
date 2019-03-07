# App Context Menu
FOLIO UI modules can populate a module-specific context menu by using the provided `<AppContextMenu>` component.

```

/* - index.js 
Ideally the AppContextMenu component is placed at the highest level within a module, so that the dropdown will render outside of any routing that's taking place.
*/
import { AppContextMenu } from '@folio/stripes/core';
import { NavList, NavListItem, NavListSection } from '@folio/stripes/components';
import packageInfo from '../package'; // package.json for "home" link

    <AppContextMenu>
    {(handleToggle) => (
      <NavList>
        <NavListSection>
          <NavListItem to={packageInfo.stripes.home} onClick={handleToggle}>
            Users Application Home
          </NavListItem>
          <NavListItem onClick={() => { shortcutModalToggle(handleToggle); }}>
            Keyboard Shortcuts
          </NavListItem>
        </NavListSection>
      </NavList>
    )}
  </AppContextMenu>
```

The `handleToggle` renderProp is used to close the menu upon clicking an item.
