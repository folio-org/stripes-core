# Rendering cross-route callouts/toasts

## Background

Callouts (or toasts) are a UI pattern where a notification is popped up in a corner of the
screen and is subsequently hidden automatically or by the user. In Stripes apps, they should
be rendered using the `Callout` component in stripes-components.

Sometimes you want to render a `Callout` in one component, unmount that component, and keep the
callout visible. A common example is when you display a callout due to some user interaction
(eg, creating a new record) and then redirect to a different route (eg, the record display). In
cases like this, the first route's component is unmounted and traditionally, the callout will
unmount as part of this.

## `CalloutContext`

The solution to this is to render your callouts as part of an app-level context that will not be unmounted.
A `CalloutContext` is created as part of stripes-core and the context `Provider` is rendered passing in a
`Callout` that has been rendered with all the top-level routes. To render to the context, it must always
be imported wherever you want to use it.

```
import { CalloutContext } from '@folio/stripes/core';
```

[If you're unfamiliar with React context, reading its docs is _highly_ recommended before continuing.](https://reactjs.org/docs/context.html)


## Usage with React context for class components

After importing the `CalloutContext`, we need have some way of getting the context's value. The easiest way
in classes is by using the `contextType` approach (though rendering a context consumer is also possible).

```
static contextType = CalloutContext;
```

Finally, use the context's value as like the current ref to a `Callout`.

```
this.context.sendCallout({ message: 'New record created with a class!' });
```

## Usage with React hooks for functional components

Usage with hooks is a bit more straightforward, since we just need to use the `useContext` hook.

```
const callout  = useContext(CalloutContext);

...

callout.sendCallout({ message: 'New record created with hooks!' });
```