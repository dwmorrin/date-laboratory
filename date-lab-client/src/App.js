import React, { useState } from "react";
import { Button, Container } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
// import MomentUtils from "@date-io/moment";
import moment from "moment";
import DateFnsUtils from "@date-io/date-fns";
import { lightFormat } from "date-fns/fp";

const ISOfmt = "YYYY-MM-DDTHH:mm:ss";

const formatJSON = lightFormat("yyyy-MM-dd'T'HH:mm:ss");

const print = (anything) => JSON.stringify(anything, null, 2);

const dateInspect = (date) => ({
  "date instanceof Date?": date instanceof Date,
  toString: date.toString(),
  toJSON: date.toJSON(),
  "date-fns": {
    formatJSON: formatJSON(date),
  },
  moment: {
    "format-no-arg": moment(date).format(),
    "format-JSON": moment(date).format(ISOfmt),
  },
});

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

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container>
        <DateTimePicker value={selectedDate} onChange={setSelectedDate} />
        <Button onClick={submit}>Send to MySQL</Button>
        <h2>current date value inspection</h2>
        <pre>{print(dateInspect(selectedDate))}</pre>
        {error && (
          <>
            <h2>error</h2>
            <pre>{print(error)}</pre>
          </>
        )}
        {results && (
          <>
            <h2>server response</h2>
            <pre>{print(results)}</pre>
          </>
        )}
      </Container>
    </MuiPickersUtilsProvider>
  );
}

export default App;
