import React from 'react';
import moment from 'moment-timezone'; // eslint-disable-line import/no-extraneous-dependencies
import { FormattedDate, FormattedTime } from 'react-intl'; // eslint-disable-line import/no-extraneous-dependencies,

export function formatDate(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timezone);
  return (<FormattedDate value={dateTime} timeZone={timezone} />);
}

// This function helps in formatting dates that are timezone agnostic (eg: birthdays)
export function formatAbsoluteDate(dateStr) {
  if (!dateStr) return dateStr;
  // Consider only the date part of the ISO string ('yyyy-mm-dd'T'hh:mm:ss') for formatting Date
  const date = moment(dateStr.split('T')[0]).format('MM-DD-YYYY');
  return (<FormattedDate value={date}/>);
}

export function formatTime(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timezone);
  return (<FormattedTime value={dateTime} timeZone={timezone} />);
}

export function formatDateTime(dateStr, timezone) {
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timezone);
  return (<span><FormattedDate value={dateTime} timeZone={timezone} /> <FormattedTime value={dateTime} timeZone={timezone} /></span>);
}
