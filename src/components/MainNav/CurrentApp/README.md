# App Context Menu
FOLIO UI modules can populate a module-specific context menu by using the provided `<AppContextMenu>` component.

```

/* - index.js 
Ideally the AppContextMenu component is placed at the highest level within a module, so that the dropdown will render outside of any routing that's taking place.
*/
import { AppContextMenu } from '@folio/stripes/core';

    <AppContextMenu>
      {(handleToggle) => (
        <React.Fragment>
          <button type="button" onClick={handleToggle}>User Application Shortcuts</button>
          {/*
           Additional menu items...
          */}
        </React.Fragment>
      )}
    </AppContextMenu>
```

The `handleToggle` renderProp is used to close the menu upon clicking an item.
