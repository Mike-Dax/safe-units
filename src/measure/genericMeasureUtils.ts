import { GenericMeasure } from "./genericMeasure"
import { IdentityMask, MarkMaskAsUsed, PrefixMask } from "./prefixMask"
import { Unit } from "./unitTypeArithmetic"

export type ValidateAllowedPrefixes<AllowedPrefixes, PrefixToApply> = AllowedPrefixes extends PrefixMask
  ? PrefixToApply extends Partial<AllowedPrefixes>
    ? AllowedPrefixes
    : never
  : never

/** A function which applies a symbol prefix and multiplier to a given measure. Contains static information about the value, name, symbol of the prefix. */
export type PrefixFn<PrefixToApply, N = number> = (<Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
  measure: GenericMeasure<N, Basis, U, ValidateAllowedPrefixes<AllowedPrefixes, PrefixToApply>>,
) => GenericMeasure<N, Basis, U, IdentityMask<MarkMaskAsUsed<AllowedPrefixes>>>) & {
  /** The numeric value of this prefix, multiplies the value of the Measure */
  readonly value: N
  /** The name of the prefix this measure represents, as lower case (e.g. milli) */
  readonly name: string
  /** The symbol of the prefix (e.g. m) */
  readonly symbol: string
}

/** A function which transforms a single measure into another measure with the same unit. */
export type UnaryFn<N = number> = <Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
  x: GenericMeasure<N, Basis, U, AllowedPrefixes>,
) => GenericMeasure<N, Basis, U, AllowedPrefixes>

/** A function which transforms two measures with same unit into a single measure with the same unit. */
export type BinaryFn<N = number> = <Basis, U extends Unit<any>, AllowedPrefixes extends PrefixMask>(
  left: GenericMeasure<N, Basis, U, AllowedPrefixes>,
  right: GenericMeasure<N, Basis, U, AllowedPrefixes>,
) => GenericMeasure<N, Basis, U, AllowedPrefixes>

/** A function which transforms one or more measure with the same unit into a single measure with the same unit. */
export type SpreadFn<N = number> = <Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
  first: GenericMeasure<N, Basis, U, AllowedPrefixes>,
  ...rest: Array<GenericMeasure<N, Basis, U, AllowedPrefixes>>
) => GenericMeasure<N, Basis, U, AllowedPrefixes>

/**
 * Converts a unary function of unitless numbers into a function of measures. This assumes that the underlying
 * operation makes no change to the unit of the measure. For example, this would be an incorrect usage:
 * `square = wrapUnaryFn((value: number) => value ** 2)` since squaring a measure would change its unit.
 * @param fn a unary function of numeric types
 * @returns a unary function of measures
 */
export function wrapUnaryFn<N>(fn: (x: N) => N): UnaryFn<N> {
  return x => x.unsafeMap(fn)
}

/**
 * Converts a binary function of unitless numbers into a function of measures. This assumes that the underlying
 * operation makes no change to the unit of the measure. For example, this would be an incorrect usage:
 * `mult = wrapBinaryFn((left, right) => left * right)` since multiplying two measures would result in a different unit.
 * @param fn a binary function of numeric types
 * @returns a binary function of measures
 */
export function wrapBinaryFn<N>(fn: (left: N, right: N) => N): BinaryFn<N> {
  return (left, right) => left.unsafeMap(lValue => fn(lValue, right.value))
}

/**
 * Converts a function of any number of unitless numbers into a function of one or more measures. This assumes that the
 * underlying operation makes no change to the unit of the measure. For example, this would be an incorrect usage:
 * `product = wrapBinaryFn((...values) => product(values))` since multiplying measures would result in a different unit.
 * Note that the resulting function requires at least one value in order to compute the unit of the resulting measure.
 * @param fn a spread function of numeric types
 * @returns a spread function of measures
 */
export function wrapSpreadFn<N>(fn: (...x: N[]) => N): SpreadFn<N> {
  return (first, ...rest) => {
    const measureValues = [first, ...rest].map(m => m.value)
    const newValue = fn(...measureValues)
    return first.unsafeMap(() => newValue)
  }
}

/**
 * Converts a binary function of unitless numbers into a function of one or more measures by using that function as a
 * reducer for the measures. This assumes that the underlying operation makes no change to the unit of the measure. For
 * example this would be an incorrect usage: `product = wrapReducerFn((prev, curr) => prev * curr)` since multiplying
 * two measures would result in a different unit. Note that the resulting function requires at least one value in order
 * to compute the unit of the resulting measure.
 * @param fn a binary function of numeric types
 * @returns a spread function of measures that reduces its arguments using the binary function passed
 */
export function wrapReducerFn<N>(fn: (curr: N, prev: N, index: number) => N): SpreadFn<N> {
  return (first, ...rest) => {
    const values = rest.map(m => m.value)
    return first.unsafeMap(() => values.reduce(fn, first.value))
  }
}
