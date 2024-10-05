import { PrefixMask } from "../../src/measure/prefixMask"
import { WrappedNumber, wrap } from "./genericMeasureIntro"

// START
import { createMeasureType, GenericMeasure, Unit } from "safe-units"

type WrappedMeasure<B, U extends Unit<B>, AllowedPrefixes extends PrefixMask> = GenericMeasure<
  WrappedNumber,
  B,
  U,
  AllowedPrefixes
>
const WrappedMeasure = createMeasureType<WrappedNumber>({
  zero: () => wrap(0),
  one: () => wrap(1),
  neg: x => wrap(-x.value),
  abs: x => wrap(Math.abs(x.value)),
  add: (x, y) => wrap(x.value + y.value),
  sub: (x, y) => wrap(x.value - y.value),
  mult: (x, y) => wrap(x.value * y.value),
  div: (x, y) => wrap(x.value / y.value),
  pow: (x, y) => wrap(Math.pow(x.value, y)),
  reciprocal: x => wrap(1 / x.value),
  round: x => wrap(Math.round(x.value)),
  floor: x => wrap(Math.floor(x.value)),
  compare: (x, y) => x.value - y.value,
  format: x => `${x}`,
})
// END

console.log(WrappedMeasure)
