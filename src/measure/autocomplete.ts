/**
 * Take a string 'mm' and predict `Measure`s that match it.
 *
 * Applies prefixes, and multiplies `Measure`s together.
 *
 *
 *
 */

import { GenericMeasure } from "./genericMeasure"
import { PrefixFn } from "./genericMeasureUtils"
import { PrefixMask } from "./prefixMask"
import { Unit } from "./unitTypeArithmetic"

export function autocomplete<N, Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
  query: string,
  measures: GenericMeasure<N, Basis, U, AllowedPrefixes>[],
  prefixes: PrefixFn<PrefixMask, N>[],
): GenericMeasure<N, Basis, U, AllowedPrefixes>[] {}
