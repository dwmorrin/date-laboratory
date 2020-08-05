import React, { useState } from "react";
import { Button, Container } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from "moment";
import DateFnsUtils from "@date-io/date-fns";
import { lightFormat } from "date-fns/fp";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const dummy8amString = "2020-08-05T12:00:00.000Z";
const dummyAsNYC = utcToZonedTime(dummy8amString, "America/New_York");
const ISOfmt = "YYYY-MM-DDTHH:mm:ss";

const formatJSON = lightFormat("yyyy-MM-dd'T'HH:mm:ss");

const print = (anything) => JSON.stringify(anything, null, 2);

const dateInspect = (date) => ({
  "date instanceof Date?": date instanceof Date,
  toString: date.toString(),
  getTime: date.getTime(),
  toJSON: date.toJSON ? date.toJSON() : "n/a",
  "JSON.stringify": JSON.stringify(date),
  "date-fns": {
    formatJSON: date instanceof Date ? formatJSON(date) : "n/a",
  },
  moment: {
    "format-no-arg": moment(date).format(),
    "format-JSON": moment(date).format(ISOfmt),
  },
});

const responseInspect = ({ error, data }) => {
  if (error || !data || !data.length) return { error };
  const { date } = data[0];
  const dateObj = new Date(date);
  const fixedTZ = zonedTimeToUtc(date, "America/New_York");
  const utcToNYC = utcToZonedTime(date, "America/New_York");
  const noTZ = new Date(date.split(".")[0]);
  return {
    data,
    date: {
      typeof: typeof date,
      asDate: {
        toString: dateObj.toString(),
        getTime: dateObj.getTime(),
      },
      inFixedTZ: {
        toString: fixedTZ.toString(),
        getTime: fixedTZ.getTime(),
      },
      "UTC to NYC": {
        toString: utcToNYC.toString(),
        getTime: utcToNYC.getTime(),
      },
      "parse without TZ": {
        toString: noTZ.toString(),
        getTIme: noTZ.getTime(),
      },
    },
  };
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

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
    setSelectedDate(utcToZonedTime(date, "America/New_York"));
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
        </Container>
      </MuiPickersUtilsProvider>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={[
          { title: "selected", start: selectedDate, end: selectedDate },
          { title: "raw dummy", start: dummy8amString, end: dummy8amString },
          { title: "dummy as NYC", start: dummyAsNYC, end: dummyAsNYC },
        ]}
      />
    </>
  );
}

export default App;
