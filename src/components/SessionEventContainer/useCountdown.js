import {
  useEffect,
  useState
} from 'react';

/**
 * useCountdown
 * Given a millisecond timestamp T, set a timer with a 1-second interval
 * that returns the number of milliseconds remaining until T.
 *
 * @param {int} expiration timestamp in milliseconds
 * @returns time remaining in milliseconds
 */
const useCountdown = (expiration) => {
  const [countdown, setCountdown] = useState(expiration - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(expiration - new Date().getTime());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [expiration]);

  return countdown;
};

export default useCountdown;
