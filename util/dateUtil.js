import React from 'react';
import moment from 'moment-timezone';
import { FormattedDate, FormattedTime } from 'react-intl';

export function formatDate(dateStr, timeZone) {
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timeZone);
  return (<FormattedDate value={dateTime} timeZone={timeZone} />);
}

export function formatTime(dateStr, timeZone) {
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timeZone);
  return (<FormattedTime value={dateTime} timeZone={timeZone} />);
}

export function formatDateTime(dateStr, timeZone) {
  if (!dateStr) return dateStr;
  const dateTime = moment.tz(dateStr, timeZone);
  return (
    <FormattedTime value={dateTime} timeZone={timeZone} day="numeric" month="numeric" year="numeric" />
  );
}
