// injects a script tag to load a remote module.
// This has to be performed in this way for publicPath of the federated remote
// to be automatically discovered since it works based on document.currentScript.src.
// Once the script is loaded, it executes webpack module federation API
// to initialize sharing and retrieve the exposed module.

function injectScript(remoteUrl, remoteName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = remoteUrl;
    script.onload = async () => {
      const container = window[remoteName];

      // eslint-disable-next-line no-undef
      await __webpack_init_sharing__('default');

      // eslint-disable-next-line no-undef
      await container.init(__webpack_share_scopes__.default);

      const factory = await container.get('./MainEntry');
      const Module = await factory();
      resolve(Module);
    };
    script.onerror = () => {
      reject(new Error(`Failed to load remote script from ${remoteUrl}`));
    };
    document.body.appendChild(script);
  });
}

export default async function loadRemoteComponent(remoteUrl, remoteName) {
  try {
    const Module = await injectScript(remoteUrl, remoteName);
    return Module;
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    throw error;
  }
}
