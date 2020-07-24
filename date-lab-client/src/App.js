import React, { useState } from "react";
import { Container, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

const print = (anything) => JSON.stringify(anything, null, 2);
const dateInspect = (date) => ({
  toString: date.toString(),
  toJSON: date.toJSON(),
});

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const submit = () =>
    fetch("/api/input", {
      method: "POST",
      body: JSON.stringify({ date: selectedDate.toJSON().split(".")[0] }),
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
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Container>
        <DateTimePicker value={selectedDate} onChange={setSelectedDate} />
        <Button onClick={submit}>Send to MySQL</Button>
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
