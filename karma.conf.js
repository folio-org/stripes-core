module.exports = (config) => {
  const testIndex = './test/bigtest/index.js';

  const configuration = {
    files: [
      { pattern: testIndex, watched: false },
    ],

    preprocessors: {
      [testIndex]: ['webpack']
    }
  };

  config.set(configuration);
};
