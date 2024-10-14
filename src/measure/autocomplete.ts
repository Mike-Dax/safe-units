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

export type MeasureAlias<N, Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask> = {
  text: string[]
  measure: GenericMeasure<N, Basis, U, AllowedPrefixes>[]
}

export function autocomplete<N, Basis, U extends Unit<Basis>, AllowedPrefixes extends PrefixMask>(
  query: string,
  measures: GenericMeasure<N, Basis, U, AllowedPrefixes>[],
  prefixes: PrefixFn<PrefixMask, N>[],
  aliases?: MeasureAlias<N, Basis, U, AllowedPrefixes>[],
): GenericMeasure<N, Basis, U, AllowedPrefixes>[] {
  //
}

// Need a 'superposition' node that can be multiple measures given some conditional
// temperature is a superposition of diff and thermo, but if it's multiplied or per'd, it collapses to difference

// Need aliases in measures

// Superposition ° for deg, degrees
// Superposition Δ for delta
