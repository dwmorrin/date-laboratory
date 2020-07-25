const mysql = require("mysql");

const makePool = (timezone = "Z") =>
  mysql.createPool({
    debug: true,
    timezone,
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

const onResult = ({ res }) => ({
  create: (error, data) =>
    res.status(error ? 500 : 201).json(error ? { error } : { data }),
  read: (error, data) =>
    res.status(error ? 500 : 200).json(error ? { error } : { data }),
});

const createOne = (table, timezone = "Z") => (req, res) =>
  makePool(timezone).query(
    "INSERT INTO ?? SET ?",
    [table, req.body],
    onResult({ req, res }).create
  );

const readOne = (table, key, timezone = "Z") => (req, res) =>
  makePool(timezone).query(
    "SELECT * FROM ?? WHERE ?? = ?",
    [table, key, req.params.id],
    onResult({ req, res }).read
  );
module.exports = { createOne, readOne };
