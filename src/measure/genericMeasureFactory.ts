import { GenericMeasure, MeasureFormatter, NumericOperations } from "./genericMeasure"
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

  /**
   * Configures and returns a string formatter.
   */
  createFormatter(
    options?: {
      /**
       * Whether to return a symbol, name or no text denoting the unit.
       */
      unitText?: "symbol" | "name" | "none"
      /**
       * The times symbol to use, by default '*'.
       */
      timesSymbol?: string
      /**
       * The separator to use between strings, by default a space.
       */
      separatorSymbol?: string
      /**
       * How to display the value, by default full-precision.
       */
      valueDisplay?: "full-precision" | "fixed-digits" | "significant-figures" | "exponential" | "to-nearest" | "none"
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
          valueDisplay: "to-nearest"
          toNearest: N
        }
      | {
          valueDisplay?: "none"
        }
    ),
  ): MeasureFormatter<N, string>
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
    dimension: (unitSystem, dimension, nameSingular, namePlural, symbol) =>
      createMeasure(num.one(), unitSystem.createDimensionUnit(dimension), unitSystem, nameSingular, namePlural, symbol),
    from: (value, quantity, nameSingular, namePlural, symbol, allowedPrefixes) =>
      createMeasure(
        num.mult(value, quantity.value),
        quantity.unit,
        quantity.unitSystem,
        nameSingular,
        namePlural,
        symbol,
        allowedPrefixes,
      ),
    createFormatter: (options = {}) => {
      const optionsWithDefaults = {
        unitText: "symbol",
        timesSymbol: "*",
        separatorSymbol: " ",
        valueDisplay: "valueDisplay",
        ...options,
      }

      const formatter: MeasureFormatter<N, string, string> = {
        round: value => `${num.format(value)}`,
        root: (value, { namePlural, nameSingular }) =>
          num.compare(value, num.one()) === 0 ? nameSingular : namePlural,
        prefix: (measure, { symbol }) => `${symbol}${measure}`,
        times: (left, right) => `${left} * ${right}`,
        over: (numerator, denominator) => `${numerator} / ${denominator}`,
        pow: (measure, power) => `${measure}^${power}`,
        reciprocal: measure => `1 / ${measure}`,
        reduce: (rounded, unit) => `${rounded} ${unit}`,
      }

      optionsWithDefaults.unitText
      optionsWithDefaults.timesSymbol
      optionsWithDefaults.separatorSymbol

      switch (optionsWithDefaults.valueDisplay) {
        case "full-precision":
          break
        case "fixed-digits":
          break
        case "significant-figures":
          break
        case "exponential":
          break
        case "to-nearest":
          break
        case "none":
          break

        default:
          break
      }

      return {}
    },
  }

  return {
    ...((staticMethods || {}) as any),
    ...common,
  }
}
