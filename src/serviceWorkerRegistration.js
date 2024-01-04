export const registerServiceWorker = async () => { };

export const unregisterServiceWorker = async () => {
  console.log('-- (rtr) unregistering service worker ...'); // eslint-disable-line no-console
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.unregister();
        console.log('-- (rtr) ... unregistered!'); // eslint-disable-line no-console
      })
      .catch((error) => {
        console.error(error.message); // eslint-disable-line no-console
      });
  }
};
