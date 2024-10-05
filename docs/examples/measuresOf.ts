import { Measure, meters, seconds } from "safe-units";

// START
const d1 = Measure.from(30, meters);
const feet = Measure.from(0.3048, meters, "ft");
const d2 = Measure.from(10, feet);
const minutes = Measure.from(60, seconds, "min");
// END

// Ensure that variables are used
console.log(d1, d2, minutes);
