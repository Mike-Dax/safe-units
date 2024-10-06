import { MeasureFormatter, NumericOperations } from "./genericMeasure"

export function createSymbolFormatter<N>(num: NumericOperations<N>): MeasureFormatter<N, string, string> {
  return {
    round: value => `${num.format(value)}`,
    root: (_value, { symbol }) => `${symbol}`,
    prefix: (measure, { symbol }) => `${symbol}${measure}`,
    times: (left, right) => `${left} * ${right}`,
    over: (numerator, denominator) => `${numerator} / ${denominator}`,
    pow: (measure, power) => `${measure}^${power}`,
    reciprocal: measure => `1 / ${measure}`,
    reduce: (rounded, unit) => `${rounded} ${unit}`,
  }
}

export function createNameFormatter<N>(num: NumericOperations<N>): MeasureFormatter<N, string, string> {
  return {
    round: value => `${num.format(value)}`,
    root: (value, { namePlural, nameSingular }) => (num.compare(value, num.one()) === 0 ? nameSingular : namePlural),
    prefix: (measure, { symbol }) => `${symbol}${measure}`,
    times: (left, right) => `${left} * ${right}`,
    over: (numerator, denominator) => `${numerator} / ${denominator}`,
    pow: (measure, power) => `${measure}^${power}`,
    reciprocal: measure => `1 / ${measure}`,
    reduce: (rounded, unit) => `${rounded} ${unit}`,
  }
}
