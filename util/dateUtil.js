import React from 'react';
import moment from 'moment-timezone'; // eslint-disable-line import/no-extraneous-dependencies
import { FormattedDate, FormattedTime } from 'react-intl'; // eslint-disable-line import/no-extraneous-dependencies,

export function getDateTime(dateStr, timezone) {
  return moment.tz(dateStr, timezone);
}

export function formatDate(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = getDateTime(dateStr, timezone);
  return (<FormattedDate value={dateTime} timeZone={timezone} />);
}

export function formatTime(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = getDateTime(dateStr, timezone);
  return (<FormattedTime value={dateTime} timeZone={timezone} />);
}

export function formatDateTime(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = getDateTime(dateStr, timezone);
  return (<span><FormattedDate value={dateTime} timeZone={timezone} /> <FormattedTime value={dateStr} timeZone={timezone} /></span>);
}
