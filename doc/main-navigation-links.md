# Main Navigation Links: Developer Guide

## Overview

Stripes Core allows modules to contribute entries to the top-level Main Navigation through `stripes.links.mainNavigation` in `package.json`.

Each entry renders as a canonical Stripes nav trigger and can behave in one of four ways:

- `route`: navigate to an internal route.
- `href`: open a link.
- `event`: run event-handling logic.
- `render`: let the module render a custom, stateful trigger-based UI.

This document describes all supported `mainNavigation` link modes, when to use each one, and how the runtime resolves them.

## Registration

Register entries under `stripes.links.mainNavigation`:

```json
{
  "stripes": {
    "links": {
      "mainNavigation": [
        {
          "route": "/inventory",
          "icon": "books",
          "caption": "ui-inventory.meta.title"
        }
      ]
    }
  }
}
```

Each item in `mainNavigation` becomes one button in the Main Navigation area.

## Supported fields

Common fields:

- `icon` (string): icon name rendered in the nav trigger.
- `caption` (string): i18n key used for the accessible label.
- `check` (string): optional static method name on the module root used to decide visibility.

Behavior fields:

- `route` (string): internal route target.
- `href` (string): href target.
- `event` (string): event name to pass into the module event handler.
- `render` (string): static renderer method name on the module root.

In normal usage, an entry should define one behavior field. If more than one is present, Stripes resolves them in this order:

1. `render`
2. `event`
3. `href`
4. `route`

That priority matters. For example, if a link has both `render` and `route`, the custom renderer wins and the route is ignored for rendering behavior.

## Visibility checks

If `check` is configured, Stripes Core looks up a static method with that name on the module root and calls it as:

```ts
import type { StripesType } from '@folio/stripes-types';

type CheckFn = (stripes: StripesType) => boolean;
```

Use `check` for:

- Feature flags.
- Permission checks.
- Tenant-specific availability.
- Configuration-based visibility.

Example:

```js
export const checkConsortiumAffiliations = (stripes) => {
  return stripes.hasPerm('ui-consortia-settings.affiliations.view');
};
```

Class-based root:

```js
class Root extends React.Component {
  static checkConsortiumAffiliations = checkConsortiumAffiliations;

  render() {
    return <AppRoutes />;
  }
}

export default Root;
```

Function-based root:

```js
function Root() {
  return <AppRoutes />;
}

Root.checkConsortiumAffiliations = checkConsortiumAffiliations;

export default Root;
```

## Route mode

### When to use it

Use `route` when the nav button should behave like normal app navigation to a route owned by the module.

Typical use cases:

- Open the module landing page.
- Open a stable home screen.
- Navigate to a settings or dashboard route.

### Example

```json
{
  "route": "/inventory",
  "icon": "books",
  "caption": "ui-inventory.meta.title"
}
```

### Notes

- This is the simplest and preferred mode for standard application navigation.
- If you only need navigation, do not use `event` or `render`.

## Href mode

### When to use it

Use `href` when the nav button should be rendered as a native anchor element instead of a React Router link.

Typical use cases:

- Link to an absolute external URL.
- Force browser-level navigation instead of client-side router navigation.
- Reuse an existing destination that should remain an `href` contractually.

### Example

```json
{
  "href": "https://docs.folio.org",
  "icon": "info",
  "caption": "ui-your-module.help"
}
```

### Notes

- `route` can also carry search parameters because its value is passed to the `to` prop of `react-router` `Link`.
- Prefer `route` for in-app navigation, including cases like `"/inventory?sort=title"`.
- Use `href` when you specifically need anchor semantics or an external URL.

## Event mode

### When to use it

Use `event` when clicking the nav button should trigger logic rather than navigate directly.

Typical use cases:

- Open an existing flow managed by an event handler.
- Perform side effects before a route change.
- Let a handler return an interceding component to render.

### Example

```json
{
  "event": "CHANGE_ACTIVE_AFFILIATION",
  "check": "checkConsortiumAffiliations",
  "icon": "flag",
  "caption": "ui-consortia-settings.affiliations"
}
```

The module must also expose an event handler method through its module definition so Stripes can resolve and invoke it.

At runtime, Stripes calls the module's event handler with the declared event string, the `stripes` object, and click-related data. A handler may:

- return `null` and only perform side effects.
- return a component, which Stripes will render.

Useful event names are exported as `coreEvents` from the package root:

```js
import { coreEvents } from '@folio/stripes/core';
```

### Notes

- Use `event` when a click side effect is the primary behavior.
- If the trigger itself needs local UI state, overlay anchoring, or dynamic badges, `render` is usually the better fit.

## Render mode

### When to use it

Use `render` when the module needs to own the full interaction model while still using the canonical Stripes nav trigger.

Typical use cases:

- Notification center trigger with unread badge.
- Toggle that opens a popover or panel.
- Real-time indicator subscribed to backend events.
- Stateful trigger that should not be reduced to navigation or side effect only.

### Registration example

```json
{
  "render": "renderNotificationsCenter",
  "icon": "flag",
  "caption": "ui-notifications-center.meta.title",
  "check": "checkNotificationsVisibility"
}
```

### Module root wiring

Class-based root:

```js
class Root extends React.Component {
  static checkNotificationsVisibility = checkNotificationsVisibility;

  static renderNotificationsCenter = renderNotificationsCenter;

  render() {
    return <AppRoutes />;
  }
}

export default Root;
```

Function-based root:

```js
function Root() {
  return <AppRoutes />;
}

Root.checkNotificationsVisibility = checkNotificationsVisibility;
Root.renderNotificationsCenter = renderNotificationsCenter;

export default Root;
```

### Render function contract

```ts
import { Icon } from '@folio/stripes/components';

interface TriggerProps {
  'aria-label': string;
  id: string;
  ref: React.Ref<HTMLElement>;
  icon: typeof Icon;
}

interface RenderProps {
  renderTrigger: (extraProps?: Optional<NavButtonProps>) => React.ReactNode;
  triggerProps: TriggerProps;
}

type RenderFn = (props: RenderProps) => React.ReactNode;
```

`renderTrigger(extraProps?)`

- Returns the canonical Stripes `NavButton` with baseline props already applied.
- Baseline props include stable `id`, `ref`, `icon`, and `aria-label`.
- `extraProps` are spread on top so the module can supply `onClick`, `aria-expanded`, `className`, badge props, and data attributes.

`triggerProps`

- Exposes the resolved props object used for the trigger.
- Most importantly, it provides a stable `ref` suitable for anchored overlays.

### Render mode example

```js
import React from 'react';

import { Popper } from '@folio/stripes/components';

export const renderNotificationsCenter = (props = {}) => {
  return <NotificationsCenterContainer {...props} />;
};

function NotificationsCenterContainer({ renderTrigger, triggerProps }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [unreadCount] = React.useState(0);

  if (!renderTrigger) {
    return null;
  }

  return (
    <div>
      {renderTrigger({
        onClick: () => setIsOpen((prev) => !prev),
        badge: unreadCount,
        badgeSize: 'small',
        'aria-expanded': isOpen,
        'aria-haspopup': 'dialog',
      })}

      {isOpen && triggerProps?.ref?.current && (
        <Popper
          anchorEl={triggerProps.ref.current}
          placement="bottom-end"
        >
          <NotificationsPanel />
        </Popper>
      )}
    </div>
  );
}
```

### Notes

- Use `renderTrigger` to render the trigger instead of creating a separate main-nav button.
- Use `triggerProps.ref.current` when you need to anchor UI to the button.
- Use `render` when the interaction is stateful or richer than navigation/click handling.

## Choosing the right mode

Use `route` when:

- The button should open a module route.
- There is no custom interaction model.

Use `href` when:

- The target is an external URL.
- You specifically need native anchor semantics.

Use `event` when:

- Clicking should invoke handler logic.
- You may need side effects or handler-driven intercession.

Use `render` when:

- The button owns local UI state.
- You need anchored UI such as a dropdown or popover.
- You need badges, indicators, or live updates.

## Accessibility and styling

For all modes:

- Provide meaningful `caption` text for the accessible label.
- Choose an `icon` that communicates intent.
- Keep behavior predictable and mode-appropriate.

For `render` specifically:

- Keep `aria-expanded` synchronized with open state.
- Add `aria-haspopup` when rendering popup content.
- Support `Escape` to close overlays.
- Return focus to the trigger when the overlay closes.

## Troubleshooting

Button does not render:

- `links.mainNavigation` is missing or not an array.
- `check` returns false.
- `caption` does not resolve to a valid i18n message.

Unexpected behavior mode is chosen:

- Multiple behavior fields are set on one entry.
- Stripes is applying the documented priority: `render`, then `event`, then `href`, then `route`.

Event mode does nothing:

- The event name is declared, but the module does not expose the expected event handler.
- The handler runs side effects and intentionally returns `null`.

Render mode cannot anchor overlay:

- `triggerProps.ref.current` is read before mount.
- The trigger is not rendered through `renderTrigger`.

## Testing guidance

For `route` mode, test:

- Trigger renders with correct label and icon.
- Navigation points to the expected route.

For `href` mode, test:

- Trigger renders as a native anchor element.
- External URL target is preserved correctly.

For `event` mode, test:

- Click invokes the handler.
- Side effects or returned interceding components behave as expected.

For `render` mode, test:

- `renderTrigger` is called.
- Trigger click updates component state.
- Overlay opens, anchors, and closes correctly.
- Optional `check` hides or shows the entry correctly.
