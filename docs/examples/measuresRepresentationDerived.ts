import { Measure, feet, minutes, pounds } from "safe-units";

// START
const yards = Measure.from(3, feet); // 0.9144 m
const stones = Measure.from(14, pounds); // 6.35029 kg
const hours = Measure.from(60, minutes); // 3600 s
// END

console.log(yards, stones, hours);
