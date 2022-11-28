import { some } from 'lodash';

function isSingleVersionCompatible(got, wanted) {
  const [gmajor, gminor, gpatch] = got.split('.');
  const [wmajor, wminor, wpatch] = wanted.split('.');

  if (gmajor !== wmajor) return false;

  const gmint = parseInt(gminor, 10);
  const wmint = parseInt(wminor, 10);
  if (gmint < wmint) return false;
  if (gmint > wmint) return true;

  const gpint = parseInt(gpatch || '0', 10);
  const wpint = parseInt(wpatch || '0', 10);
  return gpint >= wpint;
}

export default function isVersionCompatible(got, wanted) {
  return some(wanted.split(/\s+/), (w) => isSingleVersionCompatible(got, w));
}
