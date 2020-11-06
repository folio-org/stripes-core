# Ky for Okapi

Ky (https://github.com/sindresorhus/ky) is a convenient wrapper over
browsers' fetch() implementation, allowing you to avoid much of the tedious
promise-resolution and error-checking that raw fetch() needs by combining it
all into one promise. It also provides for timeouts and retries.

## useOkapiKy

useOkapiKy is a hook that sets up a Ky object that prefixes everything with
the Okapi URL and adds headersfor tenant and token.

Example usage:

```
SomeComponent = props => {
 const ky = useOkapiKy();
 ky('circulation/check-in-by-barcode', {
   method: 'POST',
   JSON: { some: 'object to encode to json...' },
 }).then(res => {
   if (res.ok) {
     //...success!
   } else {
     //...error :(
   }
 });
};
```

## withOkapiKy

withOkapiKy is a higher-order component that sets up a ky object the same way
and passes it in to the wrapped component as the prop `okapiKy`.

## Timeouts

NB. Ky adds timeout support and defaults to timing out after 10s. fetch() waits
indefinitely. You can easily configure the Ky instance returned by okapiKy to
use a different timeout or set it to `false` to let the underlying fetch() call
wait indefinitely:

```
const ky = useOkapiKy().extend({ timeout: false });
```
