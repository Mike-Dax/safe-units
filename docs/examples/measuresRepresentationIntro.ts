import { Length, Mass, Measure, Time, kilograms, meters, seconds } from "safe-units";

// START
const feet: Length = Measure.from(0.3048, meters, "ft");
const pounds: Mass = Measure.from(0.453592, kilograms, "lb");
const minutes: Time = Measure.from(60, seconds, "min");
// END

console.log(feet, pounds, minutes);
