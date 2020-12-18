# AppIcon

Displays an app's icon in various sizes.

## Usage
AppIcon supports different ways of loading icons.

***1. Use context (recommended)***
```js
  import { AppIcon } from '@folio/stripes/core';

  // Note: Make sure that the AppIcon has "stripes" in context as it relies on stripes.metadata.
  <AppIcon app="@folio/users" size="small" />
  ```
  Optional: You can supply an iconKey if you need a specific icon within an app. If the specific icon isn't bundled with the app it will simply render a placeholder.
```js
  <AppIcon app="@folio/inventory" iconKey="holdings" />
```

***2. Supply an object to the icon prop***
```js
  const icon = {
    src: '/static/some-icon.png',
    alt: 'My icon',
  };

  <AppIcon icon={icon} />
  ```

***3. Pass src and alt as props***
```js
  <AppIcon
    src="/static/some-icon.png"
    alt="My Icon"
  />
  ```

**Add a label to the icon by passing it as a child**
  ```js
  <AppIcon>
    Users
  </AppIcon>
```

## Props
Name | Type | Description | default
-- | -- | -- | --
alt | string | Adds an 'alt'-attribute on the img-tag. | undefined
app | string | The lowercased full package name of an app, e.g. "@folio/users" or "@folio/inventory". It will get the icon from metadata located in the stripes-object which should be available in React Context. Read more [here](https://github.com/folio-org/stripes-core/blob/master/doc/app-metadata.md#icons). | undefined
children | node | Add content next to the icon - e.g. a label | undefined
className | string | For adding custom class to component | undefined
icon | object | Icon in form of an object. E.g. { src, alt } | undefined
iconAligment | string | Sets the vertical alignment of the icon. Can be set to either "center" or "baseline". Setting it to "baseline" will align the icon relative to the first line of the label text (useful if the label spans over several lines). Setting it to "center" will render the icon vertically centered. | center
iconAriaHidden | bool | Applies aria-hidden to the icon element. Since `<AppIcon>`'s mostly are rendered in proximity of a label or inside an element with a label (e.g. a button), we set aria-hidden to true per default to avoid screen readers reading the alt attribute of the icon img | true
iconClassName | string | Applies a custom class on the inner icon element | undefined
iconKey | string | A specific icon-key for apps with multiple icons. Defaults to "app" which corresponds to the required default app-icon of an app. | app
size | string | Determines the size of the icon. (small, medium, large) | medium
src | string | Manually set the 'src'-attribute on the img-tag | undefined
style | object | For adding custom style to component | undefined
tag | string | Changes the rendered root HTML-element | span
