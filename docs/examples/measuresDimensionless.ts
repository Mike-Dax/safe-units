import { Measure, SIUnitSystem, meters } from "safe-units"

// START
const scalar = Measure.dimensionless(SIUnitSystem, 2)
const distance = Measure.from(20, meters)
const doubled = distance.times(scalar) // 40 m
// END

// Ensure that variables are used
console.log(doubled)
