import { Measure, meters } from "safe-units";

// START
const squareMeters = meters.squared().withIdentifiers("sq. m");

squareMeters.symbol; // "sq. m"

// All of the following lose the symbol from squareMeters:
const r1 = squareMeters.scale(2);
const r2 = Measure.from(10, squareMeters);
const r3 = Measure.divide(squareMeters, meters);
// END

console.log(r1, r2, r3);
