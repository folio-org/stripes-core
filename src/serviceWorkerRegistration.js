export const registerServiceWorker = async () => { };

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.unregister();
      })
      .catch((error) => {
        console.error(error.message); // eslint-disable-line no-console
      });
  }
};
