require("dotenv").config();
const express = require("express");
const db = require("./db");

const app = express();
app.listen(5001);

// we are a JSON api, so...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(simpleLogger);

// API routing
app.get("/api/input/:id", db.readOne("input", "id"));
app.post("/api/input", db.createOne("input"));

// unhandled requests
app.use(fourOhfour);

//--------------------------------------------------------------------------

function simpleLogger(req, _, next) {
  console.log(`Incoming request for ${req.originalUrl}`);
  console.log({ body: req.body });
  next();
}

function fourOhfour(req, res) {
  res.status(404).json({
    error: { code: 404, message: `nothing found for ${req.originalUrl}` },
  });
}
