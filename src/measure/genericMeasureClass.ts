import { defaultFormatUnit } from "./format"
import { GenericMeasure, MeasureFormatter, NumericOperations } from "./genericMeasure"
import { PrefixFn } from "./genericMeasureUtils"
import { IdentityMask, MarkMaskAsUsed, NO_PREFIX_ALLOWED, PrefixMask } from "./prefixMask"
import { UnitSystem } from "./unitSystem"
import {
  DivideUnits,
  MultiplyUnits,
  ReciprocalUnit,
  SquareUnit,
  Unit,
  CubeUnit,
  UnitToPower,
} from "./unitTypeArithmetic"

interface GenericMeasureClass<N> {
  createMeasure: <Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
    value: N,
    unit: U,
    unitSystem: UnitSystem<Basis>,
    nameSingular: string,
    namePlural: string,
    symbol: string,
    allowedPrefixes?: AllowedPrefixes,
  ) => GenericMeasure<N, Basis, U, AllowedPrefixes>
  isMeasure: (value: unknown) => value is GenericMeasure<N, any, any, any>
}

export type MeasureHistory<N, Basis, U extends Unit<Basis>> =
  | {
      type: "prefix"
      measure: GenericMeasure<N, Basis, U, any>
      multiplier: number
      name: string
      symbol: string
    }
  | {
      type: "times"
      left: GenericMeasure<N, Basis, U, any>
      right: GenericMeasure<N, Basis, U, any>
    }
  | {
      type: "over"
      left: GenericMeasure<N, Basis, U, any>
      right: GenericMeasure<N, Basis, U, any>
    }
  | {
      type: "pow"
      measure: GenericMeasure<N, Basis, U, any>
      power: number
    }
  | {
      type: "reciprocal" // unsure how to represent this with text?
      measure: GenericMeasure<N, Basis, U, any>
    }

export function createMeasureClass<N>(num: NumericOperations<N>): GenericMeasureClass<N> {
  function getFormatter(formatter: MeasureFormatter<N> | undefined): Required<MeasureFormatter<N>> {
    if (formatter === undefined) {
      return {
        formatValue: num.format,
        formatUnit: defaultFormatUnit,
      }
    } else {
      return {
        formatValue: formatter.formatValue || num.format,
        formatUnit: formatter.formatUnit || defaultFormatUnit,
      }
    }
  }

  class Measure<Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>
    implements GenericMeasure<N, Basis, U, AllowedPrefixes>
  {
    constructor(
      public readonly value: N,
      public readonly unit: U,
      public readonly unitSystem: UnitSystem<Basis>,
      public readonly nameSingular: string,
      public readonly namePlural: string,
      public readonly symbol: string,
      public readonly allowedPrefixes: PrefixMask,
    ) {}

    // Arithmetic

    public plus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.add(this.value, other.value),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public minus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.sub(this.value, other.value),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public negate(): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.neg(this.value),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public scale(value: N): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.mult(this.value, value),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public applyPrefix<PrefixToApply extends Partial<AllowedPrefixes>>(
      name: string,
      symbol: string,
      multiplier: N,
      prefixMask: PrefixToApply,
    ): GenericMeasure<N, Basis, U, IdentityMask<MarkMaskAsUsed<AllowedPrefixes>>> {
      // TODO: Check the prefix mask matches this Measure's allowed mask, otherwise throw. (An incorrect mask should have been prevented via the type system)

      // TODO: Keep the prefix information in history

      return new Measure(
        num.mult(this.value, multiplier),
        this.unit,
        this.unitSystem,
        `${name}${this.nameSingular}`,
        `${name}${this.namePlural}`,
        `${symbol}${this.symbol}`,
        NO_PREFIX_ALLOWED,
      ) as GenericMeasure<N, Basis, U, IdentityMask<MarkMaskAsUsed<AllowedPrefixes>>>
    }

    public times<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, MultiplyUnits<Basis, U, V>, AllowedPrefixes> {
      return new Measure(
        num.mult(this.value, other.value),
        this.unitSystem.multiply(this.unit, other.unit),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public over<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, AllowedPrefixes> {
      return new Measure(
        num.div(this.value, other.value),
        this.unitSystem.divide(this.unit, other.unit),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public pow<Power extends number>(
      power: Power,
    ): GenericMeasure<N, Basis, UnitToPower<Basis, U, Power>, AllowedPrefixes> {
      return new Measure(
        num.pow(this.value, power),
        this.unitSystem.pow(this.unit, power),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public reciprocal(): GenericMeasure<N, Basis, ReciprocalUnit<Basis, U>, AllowedPrefixes> {
      return new Measure(
        num.reciprocal(this.value),
        this.unitSystem.reciprocal(this.unit),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    public per<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, AllowedPrefixes> {
      return this.over(other)
    }

    public div<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, AllowedPrefixes> {
      return this.over(other)
    }

    public squared(): GenericMeasure<N, Basis, SquareUnit<Basis, U>, AllowedPrefixes> {
      return this.pow(2)
    }

    public cubed(): GenericMeasure<N, Basis, CubeUnit<Basis, U>, AllowedPrefixes> {
      return this.pow(3)
    }

    public inverse(): GenericMeasure<N, Basis, ReciprocalUnit<Basis, U>, AllowedPrefixes> {
      return this.reciprocal()
    }
    public unsafeMap<V extends Unit<Basis>>(
      valueMap: (value: N) => N,
      unitMap?: (unit: U) => V,
    ): GenericMeasure<N, Basis, V, AllowedPrefixes> {
      const newUnit = unitMap?.(this.unit) ?? this.unit
      return new Measure<Basis, V, AllowedPrefixes>(
        valueMap(this.value),
        newUnit as V,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    // Comparisons

    public compare(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): number {
      return num.compare(this.value, other.value)
    }

    public lt(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean {
      return this.compare(other) < 0
    }

    public lte(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean {
      return this.compare(other) <= 0
    }

    public eq(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean {
      return this.compare(other) === 0
    }

    public neq(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean {
      return this.compare(other) !== 0
    }

    public gte(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean {
      return this.compare(other) >= 0
    }

    public gt(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): boolean {
      return this.compare(other) > 0
    }

    public withIdentifiers<NewAllowedPrefixes extends PrefixMask>(
      nameSingular: string,
      namePlural: string,
      symbol: string,
      allowedPrefixes: NewAllowedPrefixes = {} as NewAllowedPrefixes,
    ): GenericMeasure<N, Basis, U, NewAllowedPrefixes> {
      return new Measure(this.value, this.unit, this.unitSystem, nameSingular, namePlural, symbol, allowedPrefixes)
    }

    public clone(): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        this.value,
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      )
    }

    // Formatting
    public toString(formatter?: MeasureFormatter<N>): string {
      const { formatValue, formatUnit } = getFormatter(formatter)
      return `${formatValue(this.value)} ${formatUnit(this.unit, this.unitSystem)}`.trimRight()
    }

    public in(unit: GenericMeasure<N, Basis, U, AllowedPrefixes>, formatter?: MeasureFormatter<N>): string {
      if (unit.symbol === undefined) {
        return this.toString(formatter)
      }
      const { formatValue } = getFormatter(formatter)
      const value = formatValue(num.div(this.value, unit.value))
      return `${value} ${unit.symbol}`
    }

    public valueIn(unit: GenericMeasure<N, Basis, U, AllowedPrefixes>): N {
      return num.div(this.value, unit.value)
    }

    public createConverterTo(unit: GenericMeasure<N, Basis, U, AllowedPrefixes>) {
      // This should all get inlined
      const factor = num.div(this.value, unit.value)
      const multFn = num.mult

      return (value: N): N => {
        return multFn(factor, value)
      }
    }

    public createToNearestConverter(value: N, unit: GenericMeasure<N, Basis, U, AllowedPrefixes>) {
      // This should all get inlined
      const factor = num.div(this.value, unit.value)
      const multFn = num.mult
      const roundFn = num.round
      const divideFn = num.div
      const nearest = value

      // console.log(
      //   `converting ${value} from ${this.namePlural} to the nearest ${nearest} ${unit.namePlural}. Unrounded ${unrounded} ${unit.symbol}, rounded: ${rounded} ${unit.symbol}`,
      // )

      return (value: N): N => {
        const unrounded = multFn(factor, value)
        const rounded = multFn(roundFn(divideFn(unrounded, nearest)), nearest)
        return rounded
      }
    }

    public createNameFormatter() {
      // This should all get inlined
      const single = num.one()
      const match = num.compare

      return (value: N): string => {
        if (match(value, single) === 0) {
          return this.nameSingular
        } else {
          return this.namePlural
        }
      }
    }

    public createDynamicFormatter(
      measures: GenericMeasure<N, Basis, U, AllowedPrefixes>[],
      toNearest?: N,
      text: "symbol" | "name" = "symbol",
    ): (value: N) => {
      value: N
      text: string
      converter: (value: N) => N
    } {
      // Sort measures by value from largest to smallest
      const sortedMeasures = [...measures].sort((a, b) => num.compare(b.value, a.value))

      const shouldUseToNearest = Boolean(toNearest && num.compare(toNearest, num.zero()) !== 0)

      // Create converters for each measure
      const converters = sortedMeasures.map(measure =>
        shouldUseToNearest ? this.createToNearestConverter(toNearest!, measure) : this.createConverterTo(measure),
      )

      const one = num.one()

      const textIsSymbol = text === "symbol"
      const textGetter = sortedMeasures.map(measure =>
        textIsSymbol ? (_value: N) => measure.getSymbol() : measure.createNameFormatter(),
      )

      return (value: N) => {
        for (let i = 0; i < sortedMeasures.length; i++) {
          const convertedValue = converters[i](value)

          if (num.compare(convertedValue, one) >= 0) {
            return {
              value: convertedValue,
              text: textGetter[i](convertedValue),
              converter: converters[i],
            }
          }
        }

        // If no suitable measure is found, return the last (smallest) measure
        const lastIndex = sortedMeasures.length - 1
        return {
          value: converters[lastIndex](value),
          text: textGetter[lastIndex](value),
          converter: converters[lastIndex],
        }
      }
    }

    public createMultiUnitFormatter(
      measures: GenericMeasure<N, Basis, U, AllowedPrefixes>[],
      toNearest?: N,
      text: "symbol" | "name" = "symbol",
      keepZeros: boolean = false,
    ): (value: N) => {
      value: N
      text: string
    }[] {
      if (measures.length === 0) {
        throw new Error(`must have at least one Measure`)
      }

      // Sort measures by value from largest to smallest
      const sortedMeasures = [...measures].sort((a, b) => num.compare(b.value, a.value))

      const shouldUseToNearest = Boolean(toNearest && num.compare(toNearest, num.zero()) !== 0)

      // Create converters for each measure from this Measure to the other one
      const converters = sortedMeasures.map((measure, index) =>
        index === sortedMeasures.length - 1 && shouldUseToNearest
          ? this.createToNearestConverter(toNearest!, measure)
          : this.createConverterTo(measure),
      )

      // Create converters back the other way
      const reverseConverter = sortedMeasures.map(measure => measure.createConverterTo(this))

      const textIsSymbol = text === "symbol"
      const textGetters = sortedMeasures.map(measure =>
        textIsSymbol ? (_value: N) => measure.getSymbol() : measure.createNameFormatter(),
      )

      // if there's only one sortedMeasure, just do the direct conversion
      if (sortedMeasures.length === 1) {
        return (value: N) => {
          return [
            {
              value: converters[0](value),
              text: textGetters[0](value),
            },
          ]
        }
      }

      const one = num.one()

      return (value: N) => {
        let multiplier = one
        // Handle negative numbers
        if (num.compare(value, num.zero()) < 0) {
          multiplier = num.neg(multiplier)
        }

        let bucket = num.abs(value)

        const result: { value: N; text: string }[] = []

        for (let i = 0; i < sortedMeasures.length - 1; i++) {
          const convertedValue = converters[i](bucket)
          const flooredValue = num.floor(convertedValue)

          if (num.compare(convertedValue, num.one()) >= 0) {
            result.push({
              value: num.mult(flooredValue, multiplier),
              text: textGetters[i](flooredValue),
            })
            multiplier = one
            bucket = num.sub(bucket, reverseConverter[i](flooredValue))
          } else if (keepZeros) {
            result.push({
              value: num.zero(),
              text: textGetters[i](num.zero()),
            })
          }
        }

        // handle the remainder
        const lastIndex = sortedMeasures.length - 1
        const lastConvertedValue = converters[lastIndex](bucket)

        if (num.compare(lastConvertedValue, num.zero()) > 0 || result.length === 0) {
          result.push({
            value: num.mult(lastConvertedValue, multiplier),
            text: textGetters[lastIndex](lastConvertedValue),
          })
        }

        return result
      }
    }

    public getSymbol() {
      return this.symbol
    }
  }

  return {
    createMeasure: (value, unit, unitSystem, nameSingular, namePlural, symbol, allowedPrefixes) =>
      new Measure(value, unit, unitSystem, nameSingular, namePlural, symbol, allowedPrefixes ?? {}),
    isMeasure: (value): value is GenericMeasure<N, any, any, any> => value instanceof Measure,
  }
}
