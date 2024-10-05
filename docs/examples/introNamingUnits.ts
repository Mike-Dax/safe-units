import { days, Measure, mega, micro, miles, speedOfLight, yards } from "safe-units";

const furlongs = Measure.from(220, yards, "fur");

Measure.from(8, furlongs).in(miles); // "1 mi"
Measure.from(1, miles).in(furlongs); // "8 fur"

const fortnights = Measure.from(14, days, "ftn");
const megafurlong = mega(furlongs);
const microfortnight = micro(fortnights);
const mfPerUFtn = megafurlong.per(microfortnight).withIdentifiers("Mfur/µftn");

speedOfLight.in(mfPerUFtn); // "1.8026174997852542 Mfur/µftn"
