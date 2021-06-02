import React, { useState } from "react";
import { Button, Container } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
  dateStringAdd,
  formatSQLDatetime,
  formatSQLDate,
  formatSQLTime,
  parseSQLDate,
  parseSQLDatetime,
  parseSQLTime,
  parseFCString,
  formatFCString,
} from "./date";

const print = (anything) => JSON.stringify(anything, null, 2);

const logEvent = (callback) => ({ event: { startStr } }) => {
  const ISO9075 = formatFCString(startStr);
  callback({
    startStr,
    ISO9075,
    "add 1 day": dateStringAdd(ISO9075),
    parseFCString: parseFCString(startStr).toString(),
    formatFCString: formatFCString(startStr),
  });
};

const dateInspect = (date) => ({
  "date instanceof Date?": date instanceof Date,
  toString: date.toString(),
  getTime: date.getTime(),
  toJSON: date.toJSON ? date.toJSON() : "n/a",
  "JSON.stringify": JSON.stringify(date),
  "date-fns": {
    formatISO9075: date instanceof Date ? formatSQLDatetime(date) : "n/a",
  },
});

const responseInspect = ({ error, data }) => {
  if (error || !data || !data.length) return { error };
  const { date, datetime, time } = data[0];
  const dateObj = parseSQLDate(date);
  const datetimeObj = parseSQLDatetime(datetime);
  const timeObj = parseSQLTime(time);
  return {
    data,
    date: {
      asDate: {
        toString: dateObj.toString(),
        getTime: dateObj.getTime(),
      },
    },
    datetimeObj: {
      asDate: {
        toString: datetimeObj.toString(),
      },
    },
    timeObj: {
      asDate: {
        toString: timeObj.toString(),
      },
    },
  };
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [emittedEvent, setEmittedEvent] = useState(null);

  const submit = () =>
    fetch("/api/input", {
      method: "POST",
      body: JSON.stringify({
        date: formatSQLDate(selectedDate),
        datetime: formatSQLDatetime(selectedDate),
        time: formatSQLTime(selectedDate),
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) return setError(error);
        fetch(`/api/input/${data.insertId}`)
          .then((response) => response.json())
          .then(setResults)
          .catch(setError);
      })
      .catch(setError);

  const setResponseToSelectedDate = () => {
    if (!results) return setError(new Error("no results yet"));
    const { data } = results;
    if (!data || !data.length) return setError(new Error("no data..."));
    const { datetime } = data[0];
    setSelectedDate(parseSQLDatetime(datetime));
  };

  const getDateFromServer = () =>
    fetch(`/api/input`)
      .then((response) => response.json())
      .then(({ data }) => setResults({ data: data.slice(0, 1) }))
      .catch(setError);

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Container>
          <Button onClick={getDateFromServer}>Get date from server</Button>
          <DateTimePicker value={selectedDate} onChange={setSelectedDate} />
          <Button onClick={submit}>Send to MySQL</Button>
          {results && (
            <Button onClick={setResponseToSelectedDate}>
              Set response as input
            </Button>
          )}
          <h2>current date value inspection</h2>
          <pre>{print(dateInspect(selectedDate))}</pre>
          {error && (
            <>
              <h2>error</h2>
              <pre>{print(error.toString())}</pre>
            </>
          )}
          {results && (
            <>
              <h2>server response</h2>
              <pre>{print(responseInspect(results))}</pre>
            </>
          )}
          {emittedEvent && (
            <>
              <h2>event emitted from FullCalendar</h2>
              <pre>{print(emittedEvent)}</pre>
            </>
          )}
        </Container>
      </MuiPickersUtilsProvider>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        timeZone={process.env.REACT_APP_TZ}
        events={[
          {
            title: "selected",
            start: formatSQLDatetime(selectedDate),
            end: formatSQLDatetime(selectedDate),
          },
        ]}
        eventClick={logEvent(setEmittedEvent)}
      />
    </>
  );
}

export default App;
