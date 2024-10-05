import { bars, kilograms, Measure, meters, milli, seconds } from "safe-units";

const width = Measure.from(3, meters);
const height = Measure.from(4, meters);
const area = width.times(height).scale(0.5);

const mass = Measure.from(30, kilograms);
const mps2 = meters.per(seconds.squared());
const acceleration = Measure.from(9.8, mps2);

const force = mass.times(acceleration); // 294 N
const pressure = force.over(area); // 49 Pa
const maxPressure = Measure.from(0.5, milli(bars)); // 0.5 mbar
pressure.lt(maxPressure); // true
