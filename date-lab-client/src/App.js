import React, { useState } from "react";
import { Button, Container } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { formatISO9075 } from "date-fns";
import { add } from "date-fns/fp";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const calculateInUtc = (cb) => (ISO9075) => {
  const TZ = process.env.REACT_APP_TZ || "America/New_York";
  return formatISO9075(utcToZonedTime(cb(zonedTimeToUtc(ISO9075, TZ)), TZ));
};

const add1Day = calculateInUtc(add({ days: 1 }));

const formatUtcISO9075 = (date) =>
  date.toISOString().replace("T", " ").split(".")[0];

const print = (anything) => JSON.stringify(anything, null, 2);

const logEvent = (callback) => ({ event: { start } }) => {
  const ISO9075 = formatUtcISO9075(start);
  callback({
    ISO9075,
    "add 1 day": add1Day(ISO9075),
  });
};

const dateInspect = (date) => ({
  "date instanceof Date?": date instanceof Date,
  "add 1 day": add1Day(date),
  toString: date.toString(),
  getTime: date.getTime(),
  toJSON: date.toJSON ? date.toJSON() : "n/a",
  "JSON.stringify": JSON.stringify(date),
  "date-fns": {
    formatISO9075: date instanceof Date ? formatISO9075(date) : "n/a",
  },
});

const responseInspect = ({ error, data }) => {
  if (error || !data || !data.length) return { error };
  const { date } = data[0];
  const dateObj = new Date(date);
  const noTZ = new Date(date.split(".")[0]);
  return {
    data,
    date: {
      typeof: typeof date,
      asDate: {
        toString: dateObj.toString(),
        getTime: dateObj.getTime(),
      },
      "parse without TZ": {
        toString: noTZ.toString(),
        getTIme: noTZ.getTime(),
      },
      "add 1 day": add1Day(date),
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
      body: JSON.stringify({ date: selectedDate }),
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
    const { date } = data[0];
    setSelectedDate(new Date(date));
  };

  const getDateFromServer = () =>
    fetch(`/api/input/1`)
      .then((response) => response.json())
      .then(setResults)
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
        timeZone="America/New_York"
        events={[
          {
            title: "selected",
            start: formatISO9075(selectedDate),
            end: formatISO9075(selectedDate),
          },
        ]}
        eventClick={logEvent(setEmittedEvent)}
      />
    </>
  );
}

export default App;
