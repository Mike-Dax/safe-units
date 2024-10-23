import {
  GenericMeasure,
  MeasureFormatter,
  NumericOperations,
  MeasureOperation,
  ValueFormatOptions,
} from "./genericMeasure"
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
    coefficient: N,
    unit: U,
    unitSystem: UnitSystem<Basis>,
    nameSingular: string,
    namePlural: string,
    symbol: string,
    allowedPrefixes?: AllowedPrefixes,
    constant?: N,
  ) => GenericMeasure<N, Basis, U, AllowedPrefixes>
  isMeasure: (value: unknown) => value is GenericMeasure<N, any, any, any>
}

// how can we hide the implementation details of depth from the user?

export function createMeasureClass<N>(num: NumericOperations<N>): GenericMeasureClass<N> {
  class Measure<Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>
    implements GenericMeasure<N, Basis, U, AllowedPrefixes>
  {
    public readonly operation: MeasureOperation<N>

    constructor(
      public readonly coefficient: N,
      public readonly unit: U,
      public readonly unitSystem: UnitSystem<Basis>,
      public readonly nameSingular: string,
      public readonly namePlural: string,
      public readonly symbol: string,
      public readonly allowedPrefixes: AllowedPrefixes,
      operation?: MeasureOperation<N>,
      public readonly constant = num.zero(),
    ) {
      this.operation = operation ?? {
        type: "leaf",
        measure: this as GenericMeasure<N, any, any, any>,
      }
    }

    // Arithmetic
    public plus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.add(this.coefficient, other.coefficient),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      ) as GenericMeasure<N, Basis, U, AllowedPrefixes>
    }

    public minus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.sub(this.coefficient, other.coefficient),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      ) as GenericMeasure<N, Basis, U, AllowedPrefixes>
    }

    public negate(): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.neg(this.coefficient),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      ) as GenericMeasure<N, Basis, U, AllowedPrefixes>
    }

    public scale(value: N): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        num.mult(this.coefficient, value),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      ) as GenericMeasure<N, Basis, U, AllowedPrefixes>
    }

    public applyPrefix<PrefixToApply extends Partial<AllowedPrefixes>>(
      name: string,
      symbol: string,
      multiplier: N,
      prefixMask: PrefixToApply,
    ): GenericMeasure<N, Basis, U, IdentityMask<MarkMaskAsUsed<AllowedPrefixes>>> {
      // TODO: Check the prefix mask matches this Measure's allowed mask, otherwise throw. (An incorrect mask should have been prevented via the type system)

      // Check if the prefix mask matches this Measure's allowed prefixes
      for (const key in prefixMask) {
        if (prefixMask[key] && !this.allowedPrefixes[key]) {
          throw new Error(`Prefix '${key}' is not allowed for measure ${this.namePlural}.`)
        }
      }

      return new Measure(
        num.mult(this.coefficient, multiplier),
        this.unit,
        this.unitSystem,
        `${name}${this.nameSingular}`,
        `${name}${this.namePlural}`,
        `${symbol}${this.symbol}`,
        NO_PREFIX_ALLOWED,
        { type: "prefix", measure: this as GenericMeasure<N, any, any, any>, multiplier, name, symbol },
      ) as unknown as GenericMeasure<N, Basis, U, IdentityMask<MarkMaskAsUsed<AllowedPrefixes>>>
    }

    public times<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, MultiplyUnits<Basis, U, V>, NO_PREFIX_ALLOWED> {
      return new Measure(
        num.mult(this.coefficient, other.coefficient),
        this.unitSystem.multiply(this.unit, other.unit),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        NO_PREFIX_ALLOWED,
        { type: "times", left: this as GenericMeasure<N, any, any, any>, right: other },
      )
    }

    public over<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, NO_PREFIX_ALLOWED> {
      // TODO: Disallow prefixing

      return new Measure(
        num.div(this.coefficient, other.coefficient),
        this.unitSystem.divide(this.unit, other.unit),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        NO_PREFIX_ALLOWED,
        { type: "over", left: this as GenericMeasure<N, any, any, any>, right: other },
      )
    }

    public pow<Power extends number>(
      power: Power,
    ): GenericMeasure<N, Basis, UnitToPower<Basis, U, Power>, NO_PREFIX_ALLOWED> {
      // TODO: Collapse history of repeated pow calls

      return new Measure(
        num.pow(this.coefficient, power),
        this.unitSystem.pow(this.unit, power),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        NO_PREFIX_ALLOWED,
        { type: "pow", measure: this as GenericMeasure<N, any, any, any>, power },
      )
    }

    public reciprocal(): GenericMeasure<N, Basis, ReciprocalUnit<Basis, U>, NO_PREFIX_ALLOWED> {
      return new Measure(
        num.reciprocal(this.coefficient),
        this.unitSystem.reciprocal(this.unit),
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        NO_PREFIX_ALLOWED,
        { type: "reciprocal", measure: this as GenericMeasure<N, any, any, any> },
      )
    }

    public per<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, NO_PREFIX_ALLOWED> {
      return this.over(other)
    }

    public div<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, NO_PREFIX_ALLOWED> {
      return this.over(other)
    }

    public squared(): GenericMeasure<N, Basis, SquareUnit<Basis, U>, NO_PREFIX_ALLOWED> {
      return this.pow(2)
    }

    public cubed(): GenericMeasure<N, Basis, CubeUnit<Basis, U>, NO_PREFIX_ALLOWED> {
      return this.pow(3)
    }

    public inverse(): GenericMeasure<N, Basis, ReciprocalUnit<Basis, U>, NO_PREFIX_ALLOWED> {
      return this.reciprocal()
    }
    public unsafeMap<V extends Unit<Basis>>(
      valueMap: (value: N) => N,
      unitMap?: (unit: U) => V,
    ): GenericMeasure<N, Basis, V, AllowedPrefixes> {
      const newUnit = unitMap?.(this.unit) ?? this.unit
      return new Measure<Basis, V, AllowedPrefixes>(
        valueMap(this.coefficient),
        newUnit as V,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      ) as unknown as GenericMeasure<N, Basis, V, AllowedPrefixes>
    }

    // Comparisons

    public compare(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): number {
      return num.compare(this.coefficient, other.coefficient)
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

    public withIdentifiers<NewAllowedPrefixes extends PrefixMask = AllowedPrefixes>(
      nameSingular: string,
      namePlural: string,
      symbol: string,
      allowedPrefixes: NewAllowedPrefixes = {} as NewAllowedPrefixes,
    ): GenericMeasure<N, Basis, U, NewAllowedPrefixes> {
      return new Measure(
        this.coefficient,
        this.unit,
        this.unitSystem,
        nameSingular,
        namePlural,
        symbol,
        allowedPrefixes as NewAllowedPrefixes,
      ) as unknown as GenericMeasure<N, Basis, U, NewAllowedPrefixes>
    }

    public clone(): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(
        this.coefficient,
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
      ) as unknown as GenericMeasure<N, Basis, U, AllowedPrefixes>
    }

    public superposition(
      collapse: (
        root: GenericMeasure<N, Basis, U, AllowedPrefixes>,
        leaf: GenericMeasure<N, Basis, U, AllowedPrefixes>,
      ) => GenericMeasure<N, Basis, U, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      const su = new Measure(
        this.coefficient,
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
        this.allowedPrefixes,
        { type: "superposition", collapse },
        this.constant, // this is the only operation that carries over the constant
      )

      return su as unknown as GenericMeasure<N, Basis, U, AllowedPrefixes>
    }

    // Formatting
    public format<R, PR, T, O, PO, RE, PA>(
      plural: boolean,
      formatter: MeasureFormatter<R, PR, T, O, PO, RE, PA>,
      root?: GenericMeasure<N, any, any, any>,
    ) {
      const thisGen = this as GenericMeasure<N, any, any, any>

      switch (this.operation.type) {
        case "prefix": {
          if (this.operation.measure.operation.type !== "leaf" && this.operation.measure.operation.type !== "pow") {
            throw new Error(`A non-leaf/pow operation was prefixed. This should be disallowed`)
          }

          return formatter.prefix(this.operation.measure.format(plural, formatter, root ?? thisGen), this.operation)
        }
        case "times": {
          // The left hand side loses its plurality
          return formatter.times(
            this.operation.left.format(false, formatter, root ?? thisGen),
            this.operation.right.format(plural, formatter, root ?? thisGen),
          )
        }
        case "over": {
          // The numerator is rendered as is.
          const numerator = this.operation.left.format(plural, formatter, root ?? thisGen)

          // The denominator is not pluralised.
          let denominator = this.operation.right.format(false, formatter, root ?? thisGen)

          // If the denominator operation is `times`, wrap the output in parentheses.
          if (this.operation.right.operation.type === "times") {
            denominator = formatter.parentheses(denominator)
          }

          return formatter.over(numerator, denominator)
        }
        case "pow": {
          let inner = this.operation.measure.format(plural, formatter, root ?? thisGen)

          // If the inner operation is `times`, wrap the output in parentheses.
          if (this.operation.measure.operation.type === "times") {
            inner = formatter.parentheses(inner)
          }

          return formatter.pow(inner, this.operation.power)
        }
        case "reciprocal": {
          return formatter.reciprocal(this.operation.measure.format(plural, formatter, root ?? thisGen))
        }
        case "leaf": {
          return formatter.leaf(plural, this)
        }
        case "superposition": {
          return this.operation.collapse(root ?? thisGen, thisGen).format(plural, formatter)
        }
        default: {
          throw new Error(`unimplemented operation`)
        }
      }
    }

    public createConverterTo(unit: GenericMeasure<N, Basis, U, AllowedPrefixes>) {
      if (num.compare(this.constant, num.zero()) !== 0 || num.compare(unit.constant, num.zero()) !== 0) {
        // Handle the constant offset case, eg with thermodynamic temperature units

        return (value: N): N => {
          // convert to the base unit
          const base = num.mult(num.add(value, this.constant), this.coefficient)

          // convert from the base unit
          return num.sub(num.div(base, unit.coefficient), unit.constant)
        }
      }

      // This should all get inlined
      const factor = num.div(this.coefficient, unit.coefficient)
      const multFn = num.mult

      return (value: N): N => {
        return multFn(factor, value)
      }
    }

    public createValueFormatter(options: ValueFormatOptions<N>) {
      switch (options.valueDisplay) {
        case "full-precision":
          return (value: N) => num.format(value)
        case "fixed-digits": {
          const digits = options.digits
          return (value: N) => num.toFixed(value, digits)
        }
        case "significant-figures": {
          const significantFigures = options.significantFigures
          return (value: N) => num.toPrecision(value, significantFigures)
        }
        case "exponential": {
          const fractionDigits = options.fractionDigits
          return (value: N) => num.toExponential(value, fractionDigits)
        }
        case "nearest": {
          const multFn = num.mult
          const roundFn = num.round
          const divideFn = num.div
          const nearest = options.value

          return (value: N) => {
            const rounded = multFn(roundFn(divideFn(value, nearest)), nearest)

            return num.format(rounded)
          }
        }

        default:
          throw new Error(`Value passed to valueDisplay is incorrect.`)
      }
    }

    // public createToNearestConverter(value: N, unit: GenericMeasure<N, Basis, U, AllowedPrefixes>) {
    //   // This should all get inlined
    //   const factor = num.div(this.value, unit.value)
    //   const multFn = num.mult
    //   const roundFn = num.round
    //   const divideFn = num.div
    //   const nearest = value

    //   // console.log(
    //   //   `converting ${value} from ${this.namePlural} to the nearest ${nearest} ${unit.namePlural}. Unrounded ${unrounded} ${unit.symbol}, rounded: ${rounded} ${unit.symbol}`,
    //   // )

    //   return (value: N): N => {
    //     const unrounded = multFn(factor, value)
    //     const rounded = multFn(roundFn(divideFn(unrounded, nearest)), nearest)
    //     return rounded
    //   }
    // }

    public createDynamicFormatter<R, PR, T, O, PO, RE, PA>(
      measures: GenericMeasure<N, Basis, U, any>[],
      valueFormat: ValueFormatOptions<N>,
      measureFormatter: MeasureFormatter<R, PR, T, O, PO, RE, PA>,
    ): (value: N) => {
      converted: N
      formatted: string
      measure: R | PR | T | O | PO | RE | PA
    } {
      // Sort measures by value from largest to smallest
      const sortedMeasures = [...measures].sort((a, b) => num.compare(b.coefficient, a.coefficient))

      // Create converters for each measure
      const converters = sortedMeasures.map(measure => this.createConverterTo(measure))

      const one = num.one()

      const measureFormatterArr = sortedMeasures.map(measure => {
        const plural = measure.format(true, measureFormatter)
        const singular = measure.format(false, measureFormatter)

        return (value: N) => {
          const isSingular = num.compare(value, one) === 0

          return isSingular ? singular : plural
        }
      })

      const valueFormatterArr = sortedMeasures.map(measure => measure.createValueFormatter(valueFormat))

      return (value: N) => {
        for (let i = 0; i < sortedMeasures.length; i++) {
          const convertedValue = converters[i](value)

          if (num.compare(convertedValue, one) >= 0) {
            return {
              converted: convertedValue,
              formatted: valueFormatterArr[i](convertedValue),
              measure: measureFormatterArr[i](convertedValue),
            }
          }
        }

        // If no suitable measure is found, return the last (smallest) measure
        const lastIndex = sortedMeasures.length - 1
        const convertedValue = converters[lastIndex](value)
        return {
          converted: convertedValue,
          formatted: valueFormatterArr[lastIndex](convertedValue),
          measure: measureFormatterArr[lastIndex](convertedValue),
        }
      }
    }

    public createMultiUnitFormatter<R, PR, T, O, PO, RE, PA>(
      measures: GenericMeasure<N, Basis, U, any>[],
      valueFormat: ValueFormatOptions<N>,
      measureFormatter: MeasureFormatter<R, PR, T, O, PO, RE, PA>,
      keepZeros: boolean = false,
    ): (value: N) => {
      converted: N
      formatted: string
      measure: R | PR | T | O | PO | RE | PA
    }[] {
      if (measures.length === 0) {
        throw new Error(`must have at least one Measure`)
      }

      // Sort measures by value from largest to smallest
      const sortedMeasures = [...measures].sort((a, b) => num.compare(b.coefficient, a.coefficient))

      // Create converters for each measure
      const converters = sortedMeasures.map(measure => this.createConverterTo(measure))

      // Create converters back the other way
      const reverseConverter = sortedMeasures.map(measure => measure.createConverterTo(this))

      const measureFormatterArr = sortedMeasures.map(measure => {
        const plural = measure.format(true, measureFormatter)
        const singular = measure.format(false, measureFormatter)

        return (value: N) => {
          const isSingular = num.compare(value, one) === 0

          return isSingular ? singular : plural
        }
      })

      const one = num.one()
      const zero = num.zero()

      const valueFormatterArr = sortedMeasures.map((measure, index) =>
        index < sortedMeasures.length - 1
          ? measure.createValueFormatter({ value: one, valueDisplay: "nearest" })
          : measure.createValueFormatter(valueFormat),
      )

      // if there's only one sortedMeasure, just do the direct conversion
      if (sortedMeasures.length === 1) {
        return (value: N) => {
          const convertedValue = converters[0](value)
          const f = valueFormatterArr[0]
          const m = measureFormatterArr[0]
          return [
            {
              converted: convertedValue,
              formatted: f(convertedValue),
              measure: m(convertedValue),
            },
          ]
        }
      }

      return (value: N) => {
        let multiplier = one
        // Handle negative numbers
        if (num.compare(value, num.zero()) < 0) {
          multiplier = num.neg(multiplier)
        }

        let bucket = num.abs(value)

        const result: { converted: N; formatted: string; measure: R | PR | T | O | PO | RE | PA }[] = []

        for (let i = 0; i < sortedMeasures.length - 1; i++) {
          const convertedValue = converters[i](bucket)
          const flooredValue = num.floor(convertedValue)

          if (num.compare(convertedValue, num.one()) >= 0) {
            const postMult = num.mult(flooredValue, multiplier)
            result.push({
              converted: postMult,
              formatted: valueFormatterArr[i](postMult),
              measure: measureFormatterArr[i](postMult),
            })
            multiplier = one
            bucket = num.sub(bucket, reverseConverter[i](flooredValue))
          } else if (keepZeros) {
            result.push({
              converted: zero,
              formatted: valueFormatterArr[i](zero),
              measure: measureFormatterArr[i](zero),
            })
          }
        }

        // handle the remainder
        const lastIndex = sortedMeasures.length - 1
        const lastConvertedValue = converters[lastIndex](bucket)

        if (num.compare(lastConvertedValue, num.zero()) > 0 || result.length === 0) {
          const postMult = num.mult(lastConvertedValue, multiplier)

          result.push({
            converted: postMult,
            formatted: valueFormatterArr[lastIndex](postMult),
            measure: measureFormatterArr[lastIndex](postMult),
          })
        }

        return result
      }
    }
  }

  return {
    createMeasure: (coefficient, unit, unitSystem, nameSingular, namePlural, symbol, allowedPrefixes, constant?) =>
      new Measure(
        coefficient,
        unit,
        unitSystem,
        nameSingular,
        namePlural,
        symbol,
        allowedPrefixes ?? {},
        undefined,
        constant,
      ) as GenericMeasure<N, any, any, any>,
    isMeasure: (value): value is GenericMeasure<N, any, any, any> => value instanceof Measure,
  }
}
