import { defaultFormatUnit } from "./format"
import { GenericMeasure, MeasureFormatter, NumericOperations } from "./genericMeasure"
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
    nameSingular?: string,
    namePlural?: string,
    symbol?: string,
    allowedPrefixes?: AllowedPrefixes,
  ) => GenericMeasure<N, Basis, U, AllowedPrefixes>
  isMeasure: (value: unknown) => value is GenericMeasure<N, any, any, any>
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
      public readonly nameSingular?: string,
      public readonly namePlural?: string,
      public readonly symbol?: string,
      public readonly allowedPrefixes?: PrefixMask,
    ) {}

    // Arithmetic

    public plus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(num.add(this.value, other.value), this.unit, this.unitSystem)
    }

    public minus(other: GenericMeasure<N, Basis, U, AllowedPrefixes>): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(num.sub(this.value, other.value), this.unit, this.unitSystem)
    }

    public negate(): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(num.neg(this.value), this.unit, this.unitSystem)
    }

    public scale(value: N): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(num.mult(this.value, value), this.unit, this.unitSystem)
    }

    public applyPrefix<PrefixToApply extends Partial<AllowedPrefixes>>(
      name: string,
      symbol: string,
      multiplier: N,
      prefixMask: PrefixToApply,
    ): GenericMeasure<N, Basis, U, IdentityMask<MarkMaskAsUsed<AllowedPrefixes>>> {
      // TODO: Check the prefix mask matches this Measure's allowed mask, otherwise throw. (An incorrect mask should have been prevented via the type system)

      // TODO: Apply the multiplier to the value
      // TODO: Keep the prefix information in history

      // TODO: Return a Measure with a mask that disallows further prefixing.

      return new Measure(
        num.mult(this.value, multiplier),
        this.unit,
        this.unitSystem,
        this.nameSingular,
        this.namePlural,
        this.symbol,
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
      )
    }

    public over<V extends Unit<Basis>>(
      other: GenericMeasure<N, Basis, V, AllowedPrefixes>,
    ): GenericMeasure<N, Basis, DivideUnits<Basis, U, V>, AllowedPrefixes> {
      return new Measure(
        num.div(this.value, other.value),
        this.unitSystem.divide(this.unit, other.unit),
        this.unitSystem,
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

    public pow<Power extends number>(
      power: Power,
    ): GenericMeasure<N, Basis, UnitToPower<Basis, U, Power>, AllowedPrefixes> {
      return new Measure(num.pow(this.value, power), this.unitSystem.pow(this.unit, power), this.unitSystem)
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

    public reciprocal(): GenericMeasure<N, Basis, ReciprocalUnit<Basis, U>, AllowedPrefixes> {
      return new Measure(num.reciprocal(this.value), this.unitSystem.reciprocal(this.unit), this.unitSystem)
    }

    public unsafeMap<V extends Unit<Basis>>(
      valueMap: (value: N) => N,
      unitMap?: (unit: U) => V,
    ): GenericMeasure<N, Basis, V, AllowedPrefixes> {
      const newUnit = unitMap?.(this.unit) ?? this.unit
      return new Measure<Basis, V, AllowedPrefixes>(valueMap(this.value), newUnit as V, this.unitSystem)
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

    public withIdentifiers(
      nameSingular: string | undefined,
      namePlural: string | undefined,
      symbol: string | undefined,
    ): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(this.value, this.unit, this.unitSystem, nameSingular, namePlural, symbol)
    }

    public clone(): GenericMeasure<N, Basis, U, AllowedPrefixes> {
      return new Measure(this.value, this.unit, this.unitSystem)
    }
  }

  return {
    createMeasure: (value, unit, unitSystem, nameSingular, namePlural, symbol, allowedPrefixes) =>
      new Measure(value, unit, unitSystem, nameSingular, namePlural, symbol, allowedPrefixes),
    isMeasure: (value): value is GenericMeasure<N, any, any, any> => value instanceof Measure,
  }
}
