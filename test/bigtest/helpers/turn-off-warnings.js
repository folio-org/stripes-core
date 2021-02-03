// WARN: '[@formatjs/intl] "defaultRichTextElements" was specified but "message" was not pre-compiled. 

/* eslint-disable no-console */

const warn = console.warn;
const warnBlacklist = [
  /"defaultRichTextElements" was specified but "message" was not pre-compiled/
];

const error = console.error;
const errorBlacklist = [
];

export default function turnOffWarnings() {
  console.warn = function (...args) {
    if (warnBlacklist.some(rx => rx.test(args[0]))) {
      return;
    }
    warn.apply(console, args);
  };

  console.error = function (...args) {
    if (errorBlacklist.some(rx => rx.test(args[0]))) {
      return;
    }
    error.apply(console, args);
  };
}

