import React, { useState } from "react";
import { Button, Container } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from "moment";
import DateFnsUtils from "@date-io/date-fns";
import { lightFormat } from "date-fns/fp";

const ISOfmt = "YYYY-MM-DDTHH:mm:ss";

const formatJSON = lightFormat("yyyy-MM-dd'T'HH:mm:ss");

const print = (anything) => JSON.stringify(anything, null, 2);

const dateInspect = (date) => ({
  "date instanceof Date?": date instanceof Date,
  toString: date.toString(),
  toJSON: date.toJSON ? date.toJSON() : "n/a",
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
  return {
    data,
    date: {
      typeof: typeof date,
      asDate: dateObj,
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
      body: JSON.stringify({ date: formatJSON(selectedDate) }),
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
    setSelectedDate(new Date(date.split(".")[0]));
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container>
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
  );
}

export default App;
