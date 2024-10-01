import { GenericMeasure } from "./genericMeasure"
import { Unit } from "./unitTypeArithmetic"

type MeasureAndExponent<N, Basis, U extends Unit<Basis>> = [measure: GenericMeasure<N, Basis, U>, exponent: number]

/**
 * Build a new measure given different units, falling back to the measure's unit system
 * if incomplete.
 */
export function represent<N, Basis, U extends Unit<Basis>>(
  measure: GenericMeasure<N, Basis, U>,
  using: GenericMeasure<any, Basis, any>[],
) {
  const workingExponents = { ...measure.unit }

  const positiveMeasures: MeasureAndExponent<any, Basis, any>[] = []
  const negativeMeasures: MeasureAndExponent<any, Basis, any>[] = []

  // Check each potential measure if it matches
  for (const potential of using) {
    // Skip ones without symbols
    if (!potential.symbol) {
      continue
    }

    let exhausted = true

    if (unitContains(workingExponents, potential.unit)) {
      // find the optimal exponent
      const exponent = unitContainedAtExponent(workingExponents, potential.unit)

      if (exponent === 0) {
        throw new Error(`this should have fit (positive branch)`)
      }

      // negate the unit
      exhausted = negatePartMutate(workingExponents, potential.unit, exponent)
      // add to the positive measues
      positiveMeasures.push([potential, exponent])
    } else {
      const rUnit = recipricolUnit<Basis>(potential.unit)
      if (unitContains(workingExponents, rUnit)) {
        // find the optimal exponent
        const exponent = unitContainedAtExponent(workingExponents, rUnit)

        if (exponent === 0) {
          throw new Error(`this should have fit (negative branch)`)
        }

        // negate the recipricol unit
        exhausted = negatePartMutate(workingExponents, rUnit, exponent)
        // add to the negative measues
        negativeMeasures.push([potential, exponent])
      }
    }

    if (exhausted) {
      break
    }
  }

  // form a new measure from the parts, with a new symbol
  let newMeasure: GenericMeasure<any, Basis, any> | null = null

  if (positiveMeasures.length === 0 && negativeMeasures.length === 0 && isUnitExhausted(workingExponents)) {
    // It's a unitless measure, so strip the symbol?
    return measure.withSymbol("")
  }

  const positive: SymbolAndExponent[] = []
  const negative: SymbolAndExponent[] = []

  // if there are some positive measures
  if (positiveMeasures.length > 0) {
    newMeasure = positiveMeasures[0][0]
    positive.push([positiveMeasures[0][0].symbol!, positiveMeasures[0][1]])
    for (let index = 1; index < positiveMeasures.length; index++) {
      const element = positiveMeasures[index]
      const meas = element[0]
      const expn = element[1]

      for (let j = 0; j < expn; j++) {
        newMeasure = newMeasure.times(meas)
      }

      positive.push([meas.symbol!, expn])
    }
  }

  if (negativeMeasures.length > 0) {
    let negativeMeasure = negativeMeasures[0][0]
    negative.push([negativeMeasures[0][0].symbol!, negativeMeasures[0][1]])
    for (let index = 1; index < negativeMeasures.length; index++) {
      const element = negativeMeasures[index]
      const meas = element[0]
      const expn = element[1]

      for (let j = 0; j < expn; j++) {
        negativeMeasure = negativeMeasure.times(meas)
      }
      negative.push([meas.symbol!, expn])
    }

    if (newMeasure === null) {
      newMeasure = negativeMeasure.inverse()
    } else {
      newMeasure = newMeasure.over(negativeMeasure)
    }
  }

  for (const pair of Object.entries(workingExponents)) {
    const dimension = pair[0] as keyof Basis
    const exponent = pair[1] as number

    if (exponent < 0) {
      negative.push([measure.unitSystem.getSymbol(dimension), exponent * -1])
    } else if (exponent > 0) {
      positive.push([measure.unitSystem.getSymbol(dimension), exponent])
    }
  }

  positive.sort(orderDimensions)
  negative.sort(orderDimensions)

  let sym = ""

  if (positive.length === 0) {
    sym = formatDimensions(negative)
  }

  const numerator = formatDimensions(positive)
  if (negative.length === 0) {
    sym = numerator
  }

  const denominator = formatDimensions(negative)
  sym = `${numerator} / ${maybeParenthesize(denominator, negative.length !== 1)}`

  return (newMeasure ?? measure).withSymbol(sym)
}

function negatePartMutate<Basis>(whole: Record<keyof Basis, number>, part: Record<keyof Basis, number>, mul: number) {
  let exhausted = true
  for (const pair of Object.entries(whole)) {
    const dimension = pair[0] as keyof Basis
    const exponent = part[dimension] as number
    whole[dimension] -= exponent * mul

    if (whole[dimension] !== 0) {
      exhausted = false
    }
  }
  return exhausted
}

function unitContains<Basis>(whole: Record<keyof Basis, number>, part: Record<keyof Basis, number>) {
  for (const pair of Object.entries(part)) {
    const dimension = pair[0] as keyof Basis
    //   const exponent = pair[1] as number

    if (whole[dimension] > 0) {
      // if the whole is positive in this dimension, the part must not be above in this dimension, and not be negative
      if (part[dimension] > whole[dimension] || part[dimension] < 0) {
        return false
      }
    } else if (whole[dimension] < 0) {
      // if the whole is negative in this dimension, the part must not be below in this dimension, and not be positive
      if (part[dimension] < whole[dimension] || part[dimension] > 0) {
        return false
      }
    } else {
      // if the whole is 0 in this dimension, the part must also be 0 in this dimension
      if (part[dimension] !== 0) {
        return false
      }
    }
  }
  return true
}

/**
 * Returns the largest exponent at which this unit `part` would be contained within `whole`. Returns 0 if it doesn't fit.
 */
function unitContainedAtExponent<Basis>(whole: Record<keyof Basis, number>, part: Record<keyof Basis, number>) {
  // find the smallest magnitude non-zero exponent of `part`, that's what we can step our search at
  let smallestNonZeroPartExponent: number = Infinity

  for (const v of Object.values(part)) {
    const exponent = Math.abs(v as number)

    if (exponent !== 0 && exponent < smallestNonZeroPartExponent) {
      smallestNonZeroPartExponent = exponent
    }
  }

  // This is a unitless part, don't use it in the search
  if (smallestNonZeroPartExponent === Infinity) {
    return 0
  }

  // find the largest absolute dimension of `whole`
  let largestExponentWhole: number = 0

  for (const pair of Object.entries(whole)) {
    const exponent = Math.abs(pair[1] as number)

    if (exponent > largestExponentWhole) {
      largestExponentWhole = exponent
    }
  }

  // This is a unitless whole? don't use it in the search
  if (largestExponentWhole === 0) {
    return 0
  }

  // starting at `largestExponentWhole`, check if it fits, if not, step down by `smallestNonZeroPartExponent` until we reach `smallestNonZeroPartExponent`, return at any point if it fits
  for (
    let multiple = largestExponentWhole;
    multiple >= smallestNonZeroPartExponent;
    multiple -= smallestNonZeroPartExponent
  ) {
    const m = mulUnit(part, multiple)

    if (unitContains(whole, m)) {
      return multiple
    }
  }

  // otherwise return 0
  return 0
}

function isUnitExhausted<Basis>(unit: Record<keyof Basis, number>) {
  for (const pair of Object.entries(unit)) {
    const exponent = pair[1] as number
    if (exponent > 0) return false
  }
  return true
}

function mulUnit<Basis>(unit: Record<keyof Basis, number>, mul: number) {
  const negated = { ...unit }
  for (const dimension of Object.keys(negated)) {
    negated[dimension as keyof Basis] *= mul
  }
  return negated
}

function recipricolUnit<Basis>(unit: Record<keyof Basis, number>) {
  return mulUnit(unit, -1)
}

type SymbolAndExponent = [symbol: string, exponent: number]

function orderDimensions([leftSymbol]: SymbolAndExponent, [rightSymbol]: SymbolAndExponent): number {
  return leftSymbol < rightSymbol ? -1 : 1
}

function formatDimensions(dimensions: SymbolAndExponent[]): string {
  return dimensions
    .map(([symbol, exponent]) => {
      const exponentStr = exponent !== 1 ? superscriptNumber(exponent) : ""
      return `${symbol}${exponentStr}`
    })
    .join(" ⋅ ")
}

function maybeParenthesize(text: string, parenthesize: boolean): string {
  return parenthesize ? `(${text})` : text
}

const DIGITS = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
}

export function superscriptNumber(s: number) {
  return String(s)
    .split("")
    .map((ch: string) => {
      if (ch in DIGITS) {
        return DIGITS[ch as keyof typeof DIGITS]
      }
      return ch
    })
    .join("")
}
