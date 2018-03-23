import React from 'react';
import moment from 'moment-timezone';
import { FormattedDate, FormattedTime } from 'react-intl'; // eslint-disable-line import/no-extraneous-dependencies,

export function getDateTime(dateStr, timezone){
    return moment.tz(dateStr, timezone);
}

export function formatDate(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = getDateTime(dateStr, timezone);
  return (<FormattedDate value={dateTime} />);
}

export function formatTime(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = getDateTime(dateStr, timezone);
  console.log(dateTime,"in format time");
  return (<FormattedTime value={dateTime} />);
}

export function formatDateTime(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = getDateTime(dateStr, timezone);
  return (<span><FormattedDate value={dateTime} /> <FormattedTime value={dateStr} /></span>);
}
