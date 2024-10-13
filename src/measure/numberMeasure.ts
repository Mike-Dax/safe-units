import { GenericMeasure, NumericOperations } from "./genericMeasure"
import { createMeasureType, GenericMeasureType } from "./genericMeasureFactory"
import { SpreadFn, UnaryFn, wrapSpreadFn, wrapUnaryFn } from "./genericMeasureUtils"
import { PrefixMask } from "./prefixMask"
import { Unit } from "./unitTypeArithmetic"

interface MeasureStaticMethods {
  abs: UnaryFn
  ceil: UnaryFn
  floor: UnaryFn
  fround: UnaryFn
  round: UnaryFn
  trunc: UnaryFn
  hypot: SpreadFn
}

const staticMethods: MeasureStaticMethods = {
  abs: wrapUnaryFn(Math.abs),
  ceil: wrapUnaryFn(Math.ceil),
  floor: wrapUnaryFn(Math.floor),
  fround: wrapUnaryFn(Math.fround),
  round: wrapUnaryFn(Math.round),
  trunc: wrapUnaryFn(Math.trunc),
  hypot: wrapSpreadFn(Math.hypot),
}

const numericOps: NumericOperations<number> = {
  zero: () => 0,
  one: () => 1,
  neg: x => -x,
  abs: x => Math.abs(x),
  add: (x, y) => x + y,
  sub: (x, y) => x - y,
  mult: (x, y) => x * y,
  div: (x, y) => x / y,
  pow: (x, y) => Math.pow(x, y),
  reciprocal: x => 1 / x,
  round: x => Math.round(x),
  floor: x => Math.floor(x),
  compare: (x, y) => x - y,
  format: x => String(x),
  toFixed: (x, fractionDigits) => x.toFixed(fractionDigits),
  toPrecision: (x, precision) => x.toPrecision(precision),
  toExponential: (x, fractionDigits) => x.toExponential(fractionDigits),
}

export type Measure<Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask> = GenericMeasure<
  number,
  Basis,
  U,
  AllowedPrefixes
>
export const Measure: GenericMeasureType<number, MeasureStaticMethods> = createMeasureType(numericOps, staticMethods)
