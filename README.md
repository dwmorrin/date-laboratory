# Testing Dates

Dates are a dreaded bit of data to work with, especially in a web app.

There is no universal approach to dates as how you use them is entirely
depenedent on the particular application. Therefore libraries must offer
complex configuration APIs for which the learning curve often appears to offset
the usefulness gained from using a library.

This will be a little web app Date laboratory to attempt to exhaustively work
through the options, or at least have a playground available when questions
arise in practice.

## Config

Server uses a `.env` file for database. See `/date-lab-server/db.js`.

## Initial experimentation

Using [Material-UI-Pickers](https://material-ui-pickers.dev/) in the client,
and [node mysql](https://github.com/mysqljs/mysql#readme) in the server.

### Questions:

- If the dates always refer to _events_ happening at some fixed location,
  can we store the dates in MySQL in the fixed location's timezone, or is it
  better to use UTC dates instead?
