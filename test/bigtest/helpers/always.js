/* based around convergeance, this tests that an assertion passes over a period of time,
*  rather than exiting on the first non-throw pass (as converge from @folio/stripes-testing does).
*/

export default (trial) => {
  const duration = 200;
  return async () => {
    const startTime = performance.now();
    while (true) { // eslint-disable-line no-constant-condition
      // run the trial - if it throws over the duration, it will fail.
      trial();
      const diff = performance.now() - startTime;
      if (diff > duration) {
        // the duration has run and no failures... pass!
        break;
      } else {
        // try again in 1ms...
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }
  };
};
