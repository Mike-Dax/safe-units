import {
  GenericMeasure,
  MeasureFormatter,
  MeasureOperation,
  NumericOperations,
  SerialisedMeasure,
} from "./genericMeasure"
import { createMeasureClass } from "./genericMeasureClass"
import { GenericMeasureStatic, getGenericMeasureStaticMethods } from "./genericMeasureStatic"
import { PrefixMask } from "./prefixMask"
import { UnitSystem } from "./unitSystem"
import { DimensionUnit, DimensionlessUnit, Unit } from "./unitTypeArithmetic"

/** The functions needed to construct a measure of a given numeric type */
interface GenericMeasureFactory<N> {
  /** The constructor for this generic measure type, useful for doing `instanceof` checks. */
  isMeasure(value: any): value is GenericMeasure<N, any, any, any>

  /**
   * Creates a new dimension base unit.
   * @param unitSystem the unit system for this dimension
   * @param dimension the basis of the unit system for this dimension
   * @param symbol the symbol of the base unit of the dimension (e.g. "m")
   * @returns A measure representing 1 base unit of the dimension (1 m)
   */
  dimension<Basis, Dimension extends keyof Basis, AllowedPrefixes extends PrefixMask>(
    unitSystem: UnitSystem<Basis>,
    dimension: Dimension,
    nameSingular: string,
    namePlural: string,
    symbol: string,
    allowedPrefixes?: AllowedPrefixes,
  ): GenericMeasure<N, Basis, DimensionUnit<Basis, Dimension>, AllowedPrefixes>

  /**
   * Creates a dimensionless measure.
   * @param unitSystem the unit system for this measure
   * @param value the value of the measure
   * @returns a measure with no dimensions
   */
  dimensionless<Basis, AllowedPrefixes extends PrefixMask>(
    unitSystem: UnitSystem<Basis>,
    value: N,
    allowedPrefixes?: AllowedPrefixes,
  ): GenericMeasure<N, Basis, DimensionlessUnit<Basis>, AllowedPrefixes>

  /**
   * Creates a measure as a multiple of another measure.
   * @param value the number of measures
   * @param measure the measure to be multiplied
   * @param symbol an optional unit symbol for this measure
   * @returns a measure of value number of quantities.
   */
  from<
    Basis,
    U extends Unit<Basis>,
    AllowedPrefixes extends PrefixMask,
    OverridingAllowedPrefixes extends PrefixMask = AllowedPrefixes,
  >(
    value: N,
    measure: GenericMeasure<N, Basis, U, AllowedPrefixes>,
    nameSingular: string,
    namePlural: string,
    symbol: string,
    allowedPrefixes?: OverridingAllowedPrefixes,
  ): GenericMeasure<N, Basis, U, OverridingAllowedPrefixes>

  /** Take a serialised blob and turn it into a Measure */
  deserialise<Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
    blob: SerialisedMeasure<any, any, any, any>,
  ): GenericMeasure<N, Basis, U, AllowedPrefixes>

  /**
   * Creates a measure as a multiple of another measure, with an offset.
   *
   * To convert to the base unit for the quantity use `(value + constant) * coefficient`.
   * To convert from the base unit, `(value / coefficient) - constant` is used.
   *
   * @param coefficient coefficient portion of the conversion factor
   * @param constant constant portion of the conversion factor
   * @param offset the number of measures
   * @param measure the measure to be multiplied
   * @param symbol an optional unit symbol for this measure
   * @returns a measure of value number of quantities.
   */
  offsetFrom<
    Basis,
    U extends Unit<Basis>,
    AllowedPrefixes extends PrefixMask,
    OverridingAllowedPrefixes extends PrefixMask = AllowedPrefixes,
  >(
    measure: GenericMeasure<N, Basis, U, AllowedPrefixes>,
    coefficient: N,
    constant: N,
    nameSingular: string,
    namePlural: string,
    symbol: string,
    allowedPrefixes?: OverridingAllowedPrefixes,
  ): GenericMeasure<N, Basis, U, OverridingAllowedPrefixes>

  /**
   * Configures and returns a string formatter.
   */
  createMeasureFormatter(options?: {
    /**
     * Whether to return a symbol, name or no text denoting the unit.
     */
    unitText?: "symbol" | "name"
    /**
     * The multiplication symbol to use, by default '×'.
     */
    times?: string
    /**
     * The fraction symbol to use, by default '⁄'.
     */
    per?: string
    /**
     * Whether to display values to the power of a number as superscript symbols or as their names.
     */
    pow?: "symbol" | "name"
    /**
     * Whether to use parentheses.
     */
    parentheses?: boolean
  }): MeasureFormatter<string, string, string, string, string, string, string>
}

type GenericMeasureCommon<N> = GenericMeasureFactory<N> & GenericMeasureStatic<N>

/**
 * A complete measure type for a given numeric type. This consists of:
 * - Static methods to construct measures (e.g. `Measure.of`)
 * - Predefined arithmetic static methods (e.g. `Measure.add`)
 * - User defined static methods (e.g. `Measure.abs`)
 */
export type GenericMeasureType<N, StaticMethods extends {}> = GenericMeasureCommon<N> &
  Omit<StaticMethods, keyof GenericMeasureCommon<N>>

/**
 * Creates a new measure factory for a given numeric type. The numeric type of the measure is inferred from the
 * parameter.
 * @param num the set of numeric operations needed to implement a measure for an arbitrary numeric type
 * @param staticMethods an object containing methods that should be spread into the static definition of a measure,
 * useful for attaching static math operations to the type.
 * @returns a factory for constructing measures of the given numeric type
 * @example
 * type MyMeasure<B, U extends Unit<B>> = GenericMeasure<MyNumberType, B, U>;
 * const MyMeasure = createMeasureType({ ... });
 */
export function createMeasureType<N, S extends {} = {}>(
  num: NumericOperations<N>,
  staticMethods?: S,
): GenericMeasureType<N, S> {
  const { createMeasure, isMeasure } = createMeasureClass(num)

  const common: GenericMeasureCommon<N> = {
    ...getGenericMeasureStaticMethods(num),
    isMeasure,
    dimensionless: (unitSystem, value) =>
      createMeasure(value, unitSystem.createDimensionlessUnit(), unitSystem, "", "", ""),
    dimension: (unitSystem, dimension, nameSingular, namePlural, symbol, allowedPrefixes) =>
      createMeasure(
        num.one(),
        unitSystem.createDimensionUnit(dimension),
        unitSystem,
        nameSingular,
        namePlural,
        symbol,
        allowedPrefixes,
      ),
    from: (value, quantity, nameSingular, namePlural, symbol, allowedPrefixes) =>
      createMeasure(
        num.mult(value, quantity.coefficient),
        quantity.unit,
        quantity.unitSystem,
        nameSingular,
        namePlural,
        symbol,
        allowedPrefixes,
      ),
    offsetFrom: (quantity, coefficient, constant, nameSingular, namePlural, symbol, allowedPrefixes) => {
      const base = createMeasure(
        num.mult(coefficient, quantity.coefficient),
        quantity.unit,
        quantity.unitSystem,
        nameSingular,
        namePlural,
        symbol,
        allowedPrefixes,
        constant,
      )

      return base
    },
    deserialise: blob => {
      const m = createMeasure(
        blob.coefficient,
        blob.unit,
        blob.unitSystem,
        blob.nameSingular,
        blob.namePlural,
        blob.symbol,
        blob.allowedPrefixes,
        blob.constant,
      )

      switch (blob.operation.type) {
        case "prefix": {
          ;(m as any).operation = {
            type: "prefix",
            measure: common.deserialise(blob.operation.measure),
            multiplier: blob.operation.multiplier,
            name: blob.operation.name,
            symbol: blob.operation.symbol,
          } satisfies MeasureOperation<N>
          break
        }
        case "times": {
          ;(m as any).operation = {
            type: "times",
            left: common.deserialise(blob.operation.left),
            right: common.deserialise(blob.operation.right),
          } satisfies MeasureOperation<N>
          break
        }
        case "over": {
          ;(m as any).operation = {
            type: "over",
            left: common.deserialise(blob.operation.left),
            right: common.deserialise(blob.operation.right),
          } satisfies MeasureOperation<N>
          break
        }
        case "pow": {
          ;(m as any).operation = {
            type: "pow",
            measure: common.deserialise(blob.operation.measure),
            power: blob.operation.power,
          } satisfies MeasureOperation<N>
          break
        }
        case "reciprocal": {
          ;(m as any).operation = {
            type: "reciprocal",
            measure: common.deserialise(blob.operation.measure),
          } satisfies MeasureOperation<N>
          break
        }
        case "leaf": {
          ;(m as any).operation = {
            type: "leaf",
            measure: m, // circularly reference the measure for the leaf
          } satisfies MeasureOperation<N>
          break
        }
        case "superposition": {
          ;(m as any).operation = {
            type: "superposition",
            manipulated: common.deserialise(blob.operation.manipulated),
            base: common.deserialise(blob.operation.base),
          } satisfies MeasureOperation<N>
          break
        }
        default: {
          throw new Error(`unimplemented operation`)
        }
      }

      return m
    },
    createMeasureFormatter: (options = {}) => {
      const optionsWithDefaults = {
        unitText: "symbol",
        times: "·",
        per: "/",
        pow: "symbol",
        ...options,
      }

      const multiplicationSymbol = optionsWithDefaults.times
      const fractionalSymbol = optionsWithDefaults.per

      type Formatter = MeasureFormatter<string, string, string, string, string, string, string>

      let root: Formatter["leaf"]
      let prefix: Formatter["prefix"]
      if (optionsWithDefaults.unitText === "name") {
        root = (plural, { namePlural, nameSingular }) => (plural ? namePlural : nameSingular)
        prefix = (inner, { name }) => `${name}${inner}`
      } else {
        root = (_plural, { symbol }) => symbol
        prefix = (inner, { symbol }) => `${symbol}${inner}`
      }

      let pow: Formatter["pow"]
      if (optionsWithDefaults.pow === "name") {
        pow = (inner, power) => `${inner}${createPowerDescription(power)}`
      } else {
        pow = (inner, power) => `${inner}${createUnicodeSuperscript(power)}`
      }

      let parentheses: Formatter["parentheses"]
      if (!optionsWithDefaults.parentheses === false) {
        parentheses = inner => inner
      } else {
        parentheses = inner => `(${inner})`
      }

      const formatter: MeasureFormatter<string, string, string, string, string, string, string> = {
        leaf: root,
        prefix,
        times: (left, right) => `${left}${multiplicationSymbol}${right}`,
        over: (numerator, denominator) => `${numerator}${fractionalSymbol}${denominator}`,
        pow,
        reciprocal: inner => `1 / ${inner}`,
        parentheses,
      }

      return formatter
    },
  }

  return {
    ...((staticMethods || {}) as any),
    ...common,
  }
}

function createUnicodeSuperscript(number: number): string {
  if (number === 1) {
    return ""
  }

  const superscriptDigits = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"]
  const numberString = Math.abs(number).toString()
  let result = ""

  for (let i = 0; i < numberString.length; i++) {
    const digit = parseInt(numberString[i], 10)
    result += superscriptDigits[digit]
  }

  if (number < 0) {
    result = "⁻" + result
  }

  return result
}

function createPowerDescription(power: number): string {
  switch (power) {
    case 1:
      return ""
    case 2:
      return " squared"
    case 3:
      return " cubed"
    case 4:
      return " to the fourth"
    case 5:
      return " to the fifth"
    case 6:
      return " to the sixth"
    case 7:
      return " to the seventh"
    case 8:
      return " to the eighth"
    case 9:
      return " to the ninth"
    default:
      return ` to the ${power}`
  }
}
