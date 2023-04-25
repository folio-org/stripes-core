// https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
export default async function loadRemoteComponent(remoteUrl, remoteName) {
  const container = await fetch(remoteUrl)
    .then((res) => res.text())
    .then((source) => {
      const script = document.createElement('script');
      script.textContent = source;
      document.body.appendChild(script);
      return window[remoteName];
    });

  // eslint-disable-next-line no-undef
  await __webpack_init_sharing__('default');

  // eslint-disable-next-line no-undef
  await container.init(__webpack_share_scopes__.default);

  const factory = await container.get('./MainEntry');
  const Module = await factory();
  return Module;
}
