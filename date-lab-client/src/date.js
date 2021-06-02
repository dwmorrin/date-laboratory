// date helpers

import { add, formatISO9075, parse, parseISO } from "date-fns";

const sqlFormat = {
  date: "yyyy-MM-dd",
  time: "HH:mm:ss",
};
sqlFormat.datetime = sqlFormat.date + " " + sqlFormat.time;

export const formatSQLDate = (date = new Date()) =>
  formatISO9075(date, { representation: "date" });

export const formatSQLTime = (date = new Date()) =>
  formatISO9075(date, { representation: "time" });

export const formatSQLDatetime = (date = new Date()) => formatISO9075(date);

export const parseSQLDate = (dateStr) =>
  parse(dateStr, sqlFormat.date, new Date());

export const parseSQLTime = (timeStr) =>
  parse(timeStr, sqlFormat.time, new Date());

export const parseSQLDatetime = (datetimeStr) =>
  parse(datetimeStr, sqlFormat.datetime, new Date());

/**
 * Get a date where local time matches calendar time
 * from a FullCalendar event "dateStr"
 * e.g. click on "8:30 AM", the result .toString() says "8:30 AM"
 *
 * @param {string} fcStr datetime string in ISO format without timezone info
 * @returns {Date} local time reflects calendar time
 */
export const parseFCString = (fcStr) => parseISO(fcStr);

/**
 * Formats a FullCalendar event "dateStr" into a SQL format string
 * e.g. click on "8:30 AM", the result is "8:30 AM"
 *
 * @param {string} fcStr datetime string in ISO format without timezone info
 * @returns {string} datetime string in SQL format
 */
export const formatFCString = (fcStr) => formatISO9075(parseFCString(fcStr));

/**
 * String to string date calculation
 * @param {string} dateStr SQL format datetime string
 * @param {number} days
 * @returns {string} SQL format datetime string with days added
 */
export const dateStringAdd = (dateStr, days) =>
  formatSQLDatetime(add(parseSQLDatetime(dateStr), { days }));
