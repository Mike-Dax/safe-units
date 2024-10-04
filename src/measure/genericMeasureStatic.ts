import { GenericMeasure, NumericOperations } from "./genericMeasure"
import {
  BinaryFn,
  PrefixFn,
  SpreadFn,
  wrapBinaryFn,
  wrapUnaryFn,
  wrapReducerFn,
  ValidateAllowedPrefixes,
} from "./genericMeasureUtils"
import { PrefixMask } from "./prefixMask"
import { DivideUnits, MultiplyUnits, Unit, UnitToPower } from "./unitTypeArithmetic"

export interface GenericMeasureStatic<N> {
  // /** Sums a list of one or more measures, all of the same unit. */
  sum: SpreadFn<N>

  // /** Returns the smallest of a list of one or more measures. */
  min: SpreadFn<N>

  // /** Returns the largest of a list of one or more measures. */
  max: SpreadFn<N>

  /** Static version of `left.plus(right)` */
  add: BinaryFn<N>

  /** Static version of `left.minus(right)` */
  subtract: BinaryFn<N>

  /** Static version of `left.times(right)` */
  pow<Basis, Left extends Unit<Basis>, Power extends number, AllowedPrefixes extends PrefixMask>(
    left: GenericMeasure<N, Basis, Left, AllowedPrefixes>,
    power: Power,
  ): GenericMeasure<N, Basis, UnitToPower<Basis, Left, Power>, AllowedPrefixes>

  /** Static version of `left.times(right)` */
  multiply<Basis, Left extends Unit<Basis>, Right extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
    left: GenericMeasure<N, Basis, Left, AllowedPrefixes>,
    right: GenericMeasure<N, Basis, Right, AllowedPrefixes>,
  ): GenericMeasure<N, Basis, MultiplyUnits<Basis, Left, Right>, AllowedPrefixes>

  /** Static version of `left.div(right)` */
  divide<Basis, Left extends Unit<Basis>, Right extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
    left: GenericMeasure<N, Basis, Left, AllowedPrefixes>,
    right: GenericMeasure<N, Basis, Right, AllowedPrefixes>,
  ): GenericMeasure<N, Basis, DivideUnits<Basis, Left, Right>, AllowedPrefixes>

  /**
   * Creates a function that takes a measure and applies a symbol to its prefix and scales it by a given multiplier.
   * @param name the prefix name
   * @param prefix the prefix symbol
   * @param multiplier the scalar by which to multiply measures passed into the resulting function
   * @returns a function that takes measures and adds a prefix to their symbols and multiplies them by a given value
   */
  prefix<PrefixToApply>(
    name: string,
    symbol: string,
    multiplier: N,
    allowedPrefixes: PrefixToApply,
  ): PrefixFn<PrefixToApply, N>
}

export const getGenericMeasureStaticMethods = <N>(num: NumericOperations<N>): GenericMeasureStatic<N> => {
  return {
    sum: wrapReducerFn(num.add),
    min: wrapReducerFn((left, right) => (num.compare(left, right) < 0 ? left : right)),
    max: wrapReducerFn((left, right) => (num.compare(left, right) < 0 ? right : left)),
    add: wrapBinaryFn(num.add),
    subtract: wrapBinaryFn(num.sub),
    pow: (left, right) => left.pow(right),
    multiply: (left, right) => left.times(right),
    divide: (left, right) => left.over(right),
    prefix: (name, symbol, multiplier, prefixMask) => {
      const fn = <Basis, U extends Unit<Basis>, PrefixToApply>(
        measure: GenericMeasure<N, Basis, U, ValidateAllowedPrefixes<typeof prefixMask, PrefixToApply>>,
      ) => measure.applyPrefix(name, symbol, multiplier, prefixMask as any)

      // TODO: Why do we need the as unknown cast above?

      fn.name = name
      fn.symbol = symbol
      fn.value = multiplier

      return fn as PrefixFn<typeof prefixMask, N>
    },
  }
}
