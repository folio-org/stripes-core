const parseMessageFromJsx = (translation, values) => {
  const parsedMessage = new DOMParser().parseFromString(translation, 'text/html').body.textContent || '';

  return Object.keys(values).reduce((res, key) => {
    return res.includes(key) ? res.replace(`{${key}}`, values[key]) : res;
  }, parsedMessage);
};

export default parseMessageFromJsx;
