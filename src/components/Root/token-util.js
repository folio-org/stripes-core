import localForage from 'localforage';

export const getTokenSess = async () => {
  return localForage.getItem('okapiSess');
};

export const getTokenExpiry = async () => {
  const sess = await getTokenSess();
  return new Promise((resolve) => resolve(sess?.tokenExpiration));
};

export const setTokenExpiry = async (te) => {
  const sess = await getTokenSess();
  return localForage.setItem('okapiSess', { ...sess, tokenExpiration: te });
};
