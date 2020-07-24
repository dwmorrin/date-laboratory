![screenshot](/screenshot.png)

# Date Laboratory

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

Will need database setup to match server code. Referring to the source for now.

## Initial experimentation

Using [Material-UI-Pickers](https://material-ui-pickers.dev/) in the client,
and [node mysql](https://github.com/mysqljs/mysql#readme) in the server.

I began by choosing the moment utilities for the date picker, but swiched to
date-fns.

### Questions

- If the dates always refer to **events** happening at some **fixed location**,
  - do we need to configure UI, application logic, database, and server to all
    use the fixed location timezone? (If so, how to avoid hardcoding this?)
  - can we store the dates in MySQL in the fixed location's timezone, or is it
    better to use UTC dates instead?
  - how do we handle date inputs in the UI for setting a date on a fixed
    location? e.g. the app sets events for a place in NYC. The admin is on
    vacation in LA and goes to update some events. How do we ensure that the
    date inputs are reflecting NYC time, not LA time?

### Observations

- Despite examples showing otherwise, it seems for consistent behavior that if
  using the moment.js helper utilities with Material-UI-Pickers, you should
  initialize with `moment()` and not `new Date()`. Otherwise you have to
  always consider that your untouched value is a different object than your
  touched value.

- Using date-fns, there is not the uncertainty of trying to determine if you
  have a Date object or a Moment object; you can be certain you always have
  a Date object. (This observation led me to conclude that I should switch
  to using date-fns in the particular app I am testing for.)

### Resources

[stackoverflow: Should MySQL have its timezone set to UTC?](https://stackoverflow.com/a/19075291/11359233)

[stackoverflow: MySQL datetime fields and DST](https://stackoverflow.com/a/1650910/11359233)

[stackoverflow: how to set the timezone to 'America/New_York' regardless of browser timezone? (moment.js)](https://stackoverflow.com/questions/36507159/how-to-set-the-timezone-to-america-new-york-regardless-of-browser-timezone-m)
