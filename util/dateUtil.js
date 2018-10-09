import React from 'react';
import moment from 'moment-timezone';
import { FormattedDate, FormattedTime } from 'react-intl';

export function formatDate(dateStr, timeZone) {
  console.warn(
    '\nWarning: formatDate() is deprecated and will be removed in the\n' +
         'next major version of @folio/stripes-core.\n\n' +
         'Use react-intl <FormattedDate> instead: https://github.com/yahoo/react-intl/wiki/Components\n'
  );
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timeZone);
  return (<FormattedDate value={dateTime} timeZone={timeZone} />);
}

export function formatTime(dateStr, timeZone) {
  console.warn(
    '\nWarning: formatTime() is deprecated and will be removed in the\n' +
         'next major version of @folio/stripes-core.\n\n' +
         'Use react-intl <FormattedTime> instead: https://github.com/yahoo/react-intl/wiki/Components\n'
  );
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timeZone);
  return (<FormattedTime value={dateTime} timeZone={timeZone} />);
}

export function formatDateTime(dateStr, timeZone) {
  console.warn(
    '\nWarning: formatDateTime() is deprecated and will be removed in the\n' +
         'next major version of @folio/stripes-core.\n\n' +
         'Use react-intl <FormattedTime> instead, with day/month/year props: https://github.com/yahoo/react-intl/wiki/Components\n'
  );
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timeZone);
  return (
    <FormattedTime value={dateTime} timeZone={timeZone} day="numeric" month="numeric" year="numeric" />
  );
}
