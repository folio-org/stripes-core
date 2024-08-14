/**
 * timestampFormatter
 * convert time-remaining to mm:ss. Given the remaining time can easily be
 * represented as elapsed-time since the JSDate epoch, convert to a
 * Date object, format it, and extract the minutes and seconds.
 * That is, given we have 99 seconds left, that converts to a Date
 * like `1970-01-01T00:01:39.000Z`; extract the `01:39`.
 */
// eslint-disable-next-line import/prefer-default-export
export const timestampFormatter = (remainingMillis) => {
  if (remainingMillis >= 1000) {
    return new Date(remainingMillis).toISOString().substring(14, 19);
  }

  return '00:00';
};
