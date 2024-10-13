import { IdentityMask, MarkMaskAsUsed, PrefixMask } from "./prefixMask"
import { UnitSystem } from "./unitSystem"
import {
  CubeUnit,
  DivideUnits,
  MultiplyUnits,
  ReciprocalUnit,
  SquareUnit,
  Unit,
  UnitToPower,
} from "./unitTypeArithmetic"

export type MeasureOperation<N> =
  | {
      type: "prefix"
      measure: GenericMeasure<N, any, any, any>
      multiplier: N
      name: string
      symbol: string
    }
  | {
      type: "times"
      left: GenericMeasure<N, any, any, any>
      right: GenericMeasure<N, any, any, any>
    }
  | {
      type: "over"
      left: GenericMeasure<N, any, any, any>
      right: GenericMeasure<N, any, any, any>
    }
  | {
      type: "pow"
      measure: GenericMeasure<N, any, any, any>
      power: number
    }
  | {
      type: "reciprocal" // unsure how to represent this with text?
      measure: GenericMeasure<N, any, any, any>
    }
  | {
      type: "root" // the root measure is a cyclical reference to `this`
      measure: GenericMeasure<N, any, any, any>
    }

export interface MeasureFormatter<R, PR, T, O, PO, RE, PA> {
  /** The value is provided to render the singular or plural names */
  root: (plural: boolean, ident: { symbol: string; nameSingular: string; namePlural: string }) => R
  prefix: (inner: R | PR | T | O | PO | RE | PA, ident: { symbol: string; name: string }) => PR
  times: (left: R | PR | T | O | PO | RE | PA, right: R | PR | T | O | PO | RE | PA) => T
  over: (numerator: R | PR | T | O | PO | RE | PA, denominator: R | PR | T | O | PO | RE | PA) => O
  pow: (inner: R | PR | T | O | PO | RE | PA, power: number) => PO
  reciprocal: (inner: R | PR | T | O | PO | RE | PA) => RE
  parentheses: (inner: R | PR | T | O | PO | RE | PA) => PA
}

/**
 * How to display the value.
 */
export type ValueFormatOptions<N> = {
  valueDisplay?: "full-precision" | "fixed-digits" | "significant-figures" | "exponential" | "nearest"
} & (
  | {
      valueDisplay: "full-precision"
    }
  | {
      valueDisplay: "fixed-digits"
      digits: number
    }
  | {
      valueDisplay: "significant-figures"
      significantFigures: number
    }
  | {
      valueDisplay: "exponential"
      fractionDigits: number
    }
  | {
      valueDisplay: "nearest"
      value: N
    }
)

/** The set of numeric operations required to fully represent a `GenericMeasure` for a given numeric type */
export interface NumericOperations<N> {
  /** Returns the multiplicative identity for numbers of type N */
  one(): N
  /** Returns the zero value for numbers of type N */
  zero(): N
  /** Returns the negative of a number of type N */
  neg(value: N): N
  /** Returns the abs of a number of type N */
  abs(value: N): N
  /** Returns the sum of two numbers of type N */
  add(left: N, right: N): N
  /** Returns the difference of two numbers of type N */
  sub(left: N, right: N): N
  /** Returns the product of two numbers of type N */
  mult(left: N, right: N): N
  /** Returns a number of type N to the power of a regular number */
  pow(left: N, power: number): N
  /** Returns the quotient of two numbers of type N */
  div(left: N, right: N): N
  /** Returns the reciprocal of the given number of type N */
  reciprocal(value: N): N
  /** Rounds a number of type N */
  round(value: N): N
  /** Floors a number of type N */
  floor(value: N): N
  /** Compares two numbers returning a negative, zero, or positive value. */
  compare(left: N, right: N): number
  /** Formats a number for display */
  format(value: N): string
  /**
   * Returns a string representing a number in fixed-point notation.
   * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   */
  toFixed(value: N, fractionDigits?: number): string
  /**
   * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
   * @param precision Number of significant digits. Must be in the range 1 - 21, inclusive.
   */
  toPrecision(value: N, precision?: number): string
  /**
   * Returns a string containing a number represented in exponential notation.
   * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   */
  toExponential(value: N, fractionDigits?: number): string
}

/** A numeric value with a corresponding unit of measurement. */
export interface GenericMeasure<N, Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask> {
  /** The numeric value of this measure */
  readonly value: N
  /** The unit of this measure */
  readonly unit: U
  /** The unit system of this measure */
  readonly unitSystem: UnitSystem<Basis>
  /** The name of the unit this measure represents, as a lower case singular (e.g. 1 foot) */
  readonly nameSingular: string
  /** The name of the unit this measure represents, as a lower case plural (e.g. 2 feet) */
  readonly namePlural: string
  /** The symbol of the unit this measure represents (e.g. 0.3048 m = 1 ft) */
  readonly symbol: string

  /** The operation this Measure represents in its syntax tree. For internal use. */
  readonly operation: MeasureOperation<N>

  /**
   * Adds this measure to another measure with the same unit.
   * @param other the value to add
   * @returns the sum
   */
  plus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes>

  /**
   * Subtracts another measure with the same unit from this measure.
   * @param other the value to subtract
   * @returns the difference
   */
  minus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes>

  /**
   * Negates the value of this measure.
   * @returns A measure whose value is the negative of this measure
   */
  negate(): GenericMeasure<N, Basis, U, AllowedPrefixes>

  /**
   * Multiplies this measure by a dimensionless value.
   * @param value a scalar dimensionless value by which to scale this measure
   * @returns A measure scaled by the value
   */
  scale(value: N): GenericMeasure<N, Basis, U, AllowedPrefixes>

  /**
   * Applies a prefix to this Measure with a multiplier, name and symbol
   * @param prefix a prefix to apply
   * @returns A measure scaled by the prefix
   */
  applyPrefix<PrefixToApply extends Partial<AllowedPrefixes>>(
    name: string,
    symbol: string,
    multiplier: N,
    prefixMask: PrefixToApply,
  ): GenericMeasure<N, Basis, U, IdentityMask<MarkMaskAsUsed<AllowedPrefixes>>>

  /**
   * Raises this measure to the power of a dimensionless value.
   * @param power a scalar dimensionless power by which to raise this measure
   * @returns A measure raised to this power
   */
  pow<Power extends number>(power: Power): GenericMeasure<N, Basis, UnitToPower<Basis, U, Power>, AllowedPrefixes>

  /**
   * Multiplies this measure with another measure.
   * @param other the value to multiply
   * @returns the product measure with a unit that's the product of the units
   */
  times<V extends Unit<Basis>>(
    other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
  ): GenericMeasure<N, Basis, MultiplyUnits<Basis, U, V>, AllowedPrefixes>

  /**
   * Divides this measure by another measure.
   * @param other the divisor
   * @returns the quotient measure with a unit that's the quotient of the units
   */
  over<V extends Unit<Basis>>(
    other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
  ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, AllowedPrefixes>

  /**
   * Divides this measure by another measure.
   * @param other the divisor
   * @returns the quotient measure with a unit that's the quotient of the units
   */
  per<V extends Unit<Basis>>(
    other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
  ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, AllowedPrefixes>

  /**
   * Divides this measure by another measure.
   * @param other the divisor
   * @returns the quotient measure with a unit that's the quotient of the units
   */
  div<V extends Unit<Basis>>(
    other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
  ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, AllowedPrefixes>

  /**
   * Squares the measure.
   * @returns this measure multiplied by itself
   */
  squared(): GenericMeasure<N, Basis, SquareUnit<Basis, U>, AllowedPrefixes>

  /**
   * Cubes the measure.
   * @returns this cube of this measure with a unit that's the cube of the unit
   */
  cubed(): GenericMeasure<N, Basis, CubeUnit<Basis, U>, AllowedPrefixes>

  /**
   * Returns the reciprocal of this measure.
   * @returns the reciprocal of this measure with a recriprocal unit
   */
  inverse(): GenericMeasure<N, Basis, ReciprocalUnit<Basis, U>, AllowedPrefixes>

  /**
   * Returns the reciprocal of this measure.
   * @returns the reciprocal of this measure with a recriprocal unit
   */
  reciprocal(): GenericMeasure<N, Basis, ReciprocalUnit<Basis, U>, AllowedPrefixes>

  /**
   * Maps the value and possibly unit of this measure.
   * @param valueMap a mapping on the value of the measure
   * @param unitMap an optional mapping on the unit of the measure
   * @returns a new measure whose value and unit have been mapped
   */
  unsafeMap(fn: (value: N) => N): GenericMeasure<N, Basis, U, AllowedPrefixes>
  unsafeMap<V extends Unit<Basis>>(
    valueMap: (value: N) => N,
    unitMap: (unit: U) => V,
  ): GenericMeasure<N, Basis, V, AllowedPrefixes>

  /**
   * Compares two measures to each other. Returns a negative value if this < other, a postive value if this > other
   * and 0 if the two are equal.
   * @param another measure with the same unit
   * @returns a value indicating how the value of this measure compares to the value of the other measure
   */
  compare(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): number

  /**
   * @param another measure with the same unit
   * @returns true if the value of this measure is less than the value of the other measure
   */
  lt(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean

  /**
   * @param another measure with the same unit
   * @returns true if the value of this measure is less than or equal to the value of the other measure
   */
  lte(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean

  /**
   * @param another measure with the same unit
   * @returns true if the value of this measure is equal to the value of the other measure
   */
  eq(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean

  /**
   * @param another measure with the same unit
   * @returns true if the value of this measure is not equal to the value of the other measure
   */
  neq(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean

  /**
   * @param another measure with the same unit
   * @returns true if the value of this measure is greater than or equal to the value of the other measure
   */
  gte(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean

  /**
   * @param another measure with the same unit
   * @returns true if the value of this measure is greater than the value of the other measure
   */
  gt(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean

  /**
   * Formats a measure with a given value.
   *
   * Optionally takes a custom formatter. By default uses a symbol formatter.
   */
  format<C, R, PR, T, O, PO, RE, PA>(
    plural: boolean,
    formatter?: MeasureFormatter<R, PR, T, O, PO, RE, PA>,
  ): R | PR | T | O | PO | RE | PA

  /**
   * Formats the value and the unit.
   * @returns a string representation of measure
   */
  // toString(formatter?: MeasureFormatter<N>): string

  /**
   * Formats this measure as a product of another unit. If the given unit has a symbol, this will format as a number
   * followed by that symbol. If not, this is equivalent to calling `toString()`.
   * @param a unit to be used to represent this measure
   * @returns a string representation of measure
   */
  // in(unit: GenericMeasure<N, Basis, U, AllowedPrefixes>, formatter?: MeasureFormatter<N>): string

  /**
   * Returns the value of this measure as a product of another unit. This can be used to quickly convert a measure to
   * that unit and extract its underlying value.
   * @param unit a measure of the same unit to convert this measure into
   * @returns the numeric value of this unit expressed in the given unit
   */
  // valueIn(unit: GenericMeasure<N, Basis, U, AllowedPrefixes>): N

  /**
   * Adds a symbol to this measure.
   * @param symbol the symbol of the unit represented by this measure
   */
  withIdentifiers(
    nameSingular: string,
    namePlural: string,
    symbol: string,
  ): GenericMeasure<N, Basis, U, AllowedPrefixes>

  /** Shallow copies this measure instance. */
  clone(): GenericMeasure<N, Basis, U, AllowedPrefixes>

  /** Creates a converter function that converts a value of this Measure to a value in another measure. */
  createConverterTo(unit: GenericMeasure<N, Basis, U, AllowedPrefixes>): (value: N) => N

  /**
   * Create a function that takes a value of this unit and returns a formatted string.
   *
   * By default, the string is a full precision representation of the value.
   */
  createValueFormatter(options: ValueFormatOptions<N>): (value: N) => string

  /**
   * Given an array of Measures, creates a function that takes a value of this Measure
   * and finds the smallest converted value above 1.
   *
   * It returns this converted value, the rounded and formatted value using the provided
   * `valueFormatter` and `measureFormatter`.
   */
  createDynamicFormatter<R, PR, T, O, PO, RE, PA>(
    measures: GenericMeasure<N, Basis, U, AllowedPrefixes>[],
    valueFormat: ValueFormatOptions<N>,
    measureFormatter: MeasureFormatter<R, PR, T, O, PO, RE, PA>,
  ): (value: N) => {
    converted: N
    formatted: string
    measure: R | PR | T | O | PO | RE | PA
  }

  /**
   * Given an array of Measures, creates a function that takes a value of this Measure
   * and returns an array of text and value properties representing the units used to format
   * the passed value.
   *
   * It uses each Measure in order, skipping it if it produces less than 1 of a Measure.
   *
   * Optionally the final Measure can be rounded to the nearest `toNearest` number.
   *
   * Optionally Measure's with a zero value can be skipped in the final output.
   *
   * eg 190.5cm = 6 feet, 3 inches
   *
   * eg 3664 seconds = 1 hour, 1 minute, 4 seconds
   */
  createMultiUnitFormatter<R, PR, T, O, PO, RE, PA>(
    measures: GenericMeasure<N, Basis, U, AllowedPrefixes>[],
    valueFormat: ValueFormatOptions<N>,
    measureFormatter: MeasureFormatter<R, PR, T, O, PO, RE, PA>,
    keepZeros?: boolean,
  ): (value: N) => {
    converted: N
    formatted: string
    measure: R | PR | T | O | PO | RE | PA
  }[]
}

/**
 * Translates a measure type from one numeric type to another while preserving the unit.
 * @example
 * const metersPerSecond = meters.per(seconds);
 * type Velocity<N> = LiftMeasure<typeof metersPerSecond, N>;
 */
export type LiftMeasure<M extends GenericMeasure<any, any, any, any>, N> =
  M extends GenericMeasure<any, infer Basis, infer Unit, infer AllowedPrefixes>
    ? GenericMeasure<N, Basis, Unit, AllowedPrefixes>
    : never
