import {
  useEffect,
  useState
} from 'react';

/**
 * useCountdown
 * Given a number of milliseconds, return the time remaining in 1-second
 * increments. e.g. given 10,000, return 10,000, then 9,000, ... 0. The
 * countdown is handled via setInterval; the timer is cleared when the
 * comonent is unmounted.
 *
 * @param {int} millis timestamp in milliseconds
 * @returns time remaining in milliseconds
 */
const useCountdown = (millis) => {
  const [countdown, setCountdown] = useState(millis);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(i => i - 1000);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [millis]);

  return countdown;
};

export default useCountdown;
