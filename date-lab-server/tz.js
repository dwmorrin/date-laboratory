const d = require("date-fns");
const dz = require("date-fns-tz");

const ISO9075 = "2020-09-03 08:00:00";
// const ISO8601 = "2020-09-03T08:00:00.000Z";

const alwaysNYC = dz.zonedTimeToUtc(ISO9075, "America/New_York");

console.log("time", alwaysNYC.getTime());
console.log("to string", alwaysNYC.toString());
