import { Measure } from "../numberMeasure"

import {
  meters,
  grams,
  seconds,
  amperes,
  kelvinDifference,
  moles,
  candelas,
  radians,
  steradians,
  bits,
} from "../../unit"
import {
  hertz,
  newtons,
  pascals,
  joules,
  watts,
  volts,
  coulombs,
  farads,
  ohms,
  siemens,
  henrys,
  webers,
  teslas,
  sieverts,
  katals,
  lumens,
  luxes,
} from "../../unit/metric"
import { liters, speedOfLight, bars, atmospheres, torrs } from "../../unit/other"
import { bytes } from "../../unit/memory"
import {
  minutes,
  hours,
  days,
  inches,
  feet,
  yards,
  miles,
  nauticalMiles,
  acres,
  pounds,
  ounces,
} from "../../unit/common"
import { degrees, arcMinutes, arcSeconds } from "../../unit/angle"

import {
  yotta,
  zetta,
  exa,
  peta,
  tera,
  giga,
  mega,
  kilo,
  hecto,
  deca,
  deci,
  centi,
  milli,
  micro,
  nano,
  pico,
  femto,
  atto,
  zepto,
  yocto,
} from "../../unit/metric"

import { kibi, mebi, gibi, tebi, pibi, exbi, zebi, yobi } from "../../unit/memory"
import { PrefixFn } from "../genericMeasureUtils"
import { superscriptNumber } from "../represent"

/**
 * TODO
 *
 * Where do we need to display the names, where do we display symbols?
 * Where is it a rich input, a symbol,
 *
 * Autocomplete rich inputs, name + symbol + quantity
 * Chart / formatters just symbols.
 *
 * So maybe just need an autocomplete tree for dimString -> MeasureWithIdentifiers[]
 *
 * -- In
 *
 * ---
 *
 * prefixFn should have name and symbol attributes so we can pull them out
 *
 * Measure.withIdentifiers(name, symbol)
 *
 * Any operation like .over or .times wipes those identifiers.
 *
 * type CompoundMeasure = {
 *   numerator: { prefix?: prefixFn, measure: Measure },
 *   denominator?: { prefix?: prefixFn, measure: Measure },
 * }
 *
 * function represent(measure, withMeasures: Measure[]): CompoundMeasure
 *
 * Whenever displaying a unit to a human, call `represent` with the measure and the measures that should be used for this.
 *
 * toDimString(measure): string -> a hash of the dimensions of the measure
 *
 * Store objects of every dimension string -> nice names
 * every dimension -> list of the measures.
 * Then they can call represent with only the measures they want, otherwise it defaults to the unit system.
 *
 */
export type PrefixWithIdentifiers = {
  fn: PrefixFn
  symbol: string
  name: string
}

export type MeasureWithIdentifiers = {
  measure: Measure<any, any>
  symbol: string
  name: string
}

const prefixesObject = {
  // metric
  yotta: { fn: yotta, symbol: "Y", name: "yotta" },
  zetta: { fn: zetta, symbol: "Z", name: "zetta" },
  exa: { fn: exa, symbol: "E", name: "exa" },
  peta: { fn: peta, symbol: "P", name: "peta" },
  tera: { fn: tera, symbol: "T", name: "tera" },
  giga: { fn: giga, symbol: "G", name: "giga" },
  mega: { fn: mega, symbol: "M", name: "mega" },
  kilo: { fn: kilo, symbol: "k", name: "kilo" },
  hecto: { fn: hecto, symbol: "h", name: "hecto" },
  deca: { fn: deca, symbol: "da", name: "deca" },
  deci: { fn: deci, symbol: "d", name: "deci" },
  centi: { fn: centi, symbol: "c", name: "centi" },
  milli: { fn: milli, symbol: "m", name: "milli" },
  micro: { fn: micro, symbol: "μ", name: "micro" },
  nano: { fn: nano, symbol: "n", name: "nano" },
  pico: { fn: pico, symbol: "p", name: "pico" },
  femto: { fn: femto, symbol: "f", name: "femto" },
  atto: { fn: atto, symbol: "a", name: "atto" },
  zepto: { fn: zepto, symbol: "z", name: "zepto" },
  yocto: { fn: yocto, symbol: "y", name: "yocto" },

  // memory
  kibi: { fn: kibi, symbol: "Ki", name: "kibi" },
  mebi: { fn: mebi, symbol: "Mi", name: "mebi" },
  gibi: { fn: gibi, symbol: "Gi", name: "gibi" },
  tebi: { fn: tebi, symbol: "Ti", name: "tebi" },
  pibi: { fn: pibi, symbol: "Pi", name: "pibi" },
  exbi: { fn: exbi, symbol: "Ei", name: "exbi" },
  zebi: { fn: zebi, symbol: "Zi", name: "zebi" },
  yobi: { fn: yobi, symbol: "Yi", name: "yobi" },
} as const

const prefixes: PrefixWithIdentifiers[] = Object.values(prefixesObject)

const measuresObject = {
  meters: { measure: meters, symbol: "m", name: "meter" },
  kilograms: { measure: kilo(grams), symbol: "kg", name: "kilogram" },
  seconds: { measure: seconds, symbol: "s", name: "second" },
  amperes: { measure: amperes, symbol: "A", name: "ampere" },
  kelvins: { measure: kelvinDifference, symbol: "K", name: "kelvin" },
  moles: { measure: moles, symbol: "mol", name: "mole" },
  candelas: { measure: candelas, symbol: "cd", name: "candela" },
  radians: { measure: radians, symbol: "rad", name: "radian" },
  steradians: { measure: steradians, symbol: "sr", name: "steradian" },
  hertz: { measure: hertz, symbol: "Hz", name: "hertz" },
  newtons: { measure: newtons, symbol: "N", name: "newton" },
  pascals: { measure: pascals, symbol: "Pa", name: "pascal" },
  joules: { measure: joules, symbol: "J", name: "joule" },
  watts: { measure: watts, symbol: "W", name: "watt" },
  volts: { measure: volts, symbol: "V", name: "volt" },
  coulombs: { measure: coulombs, symbol: "C", name: "coulomb" },
  farads: { measure: farads, symbol: "F", name: "farad" },
  ohms: { measure: ohms, symbol: "Ω", name: "ohm" },
  siemens: { measure: siemens, symbol: "S", name: "siemens" },
  henries: { measure: henrys, symbol: "H", name: "henry" },
  webers: { measure: webers, symbol: "Wb", name: "weber" },
  teslas: { measure: teslas, symbol: "T", name: "tesla" },
  sieverts: { measure: sieverts, symbol: "Sv", name: "sievert" },
  katals: { measure: katals, symbol: "kat", name: "katal" },
  lumens: { measure: lumens, symbol: "lm", name: "lumen" },
  luxes: { measure: luxes, symbol: "lx", name: "lux" },
  liters: { measure: liters, symbol: "L", name: "liter" },
  speedsOfLight: { measure: speedOfLight, symbol: "C", name: "speed of light" },
  bars: { measure: bars, symbol: "bar", name: "bar" },
  atmospheres: { measure: atmospheres, symbol: "atm", name: "atmosphere" },
  torrs: { measure: torrs, symbol: "Torr", name: "torr" },
  bits: { measure: bits, symbol: "bit", name: "bit" },
  bytes: { measure: bytes, symbol: "B", name: "byte" },
  minutes: { measure: minutes, symbol: "min", name: "minute" },
  hours: { measure: hours, symbol: "hr", name: "hour" },
  days: { measure: days, symbol: "d", name: "day" },
  inches: { measure: inches, symbol: "in", name: "inch" },
  feet: { measure: feet, symbol: "ft", name: "foot" },
  yards: { measure: yards, symbol: "yd", name: "yard" },
  miles: { measure: miles, symbol: "mi", name: "mile" },
  nauticalMiles: {
    measure: nauticalMiles,
    symbol: "nmi",
    name: "nautical mile",
  },
  acres: { measure: acres, symbol: "acre", name: "acre" },
  pounds: { measure: pounds, symbol: "lb", name: "pound" },
  ounces: { measure: ounces, symbol: "oz", name: "ounce" },
  degrees: { measure: degrees, symbol: "deg", name: "degree" },
  arcMinutes: { measure: arcMinutes, symbol: "arcmin", name: "arcminute" },
  arcSeconds: { measure: arcSeconds, symbol: "arcsec", name: "arcsecond" },
} as const

const measures: MeasureWithIdentifiers[] = Object.values(measuresObject)

export type CompoundUnitPart = {
  prefix?: PrefixWithIdentifiers
  measure?: MeasureWithIdentifiers
  exponent?: number
}

export type CompoundUnit = {
  unit: CompoundUnitPart
  over?: CompoundUnitPart
}

export type CompoundUnitPredictionWithDenominator = {
  unit: CompoundUnitPart
  over?: CompoundUnitPart
  score?: number
  leftovers?: string
}

export type CompoundUnitPredictionWithDenominatorTopK = {
  unit: CompoundUnitPart
  over?: CompoundUnitPart
  score?: number
  leftovers?: string
  top?: number
}

const PERFECT_PREFIX_SYMBOL_MATCH = 5
const PERFECT_PREFIX_NAME_MATCH = 10
const PERFECT_MEASURE_SYMBOL_MATCH = 5
const PERFECT_MEASURE_NAME_MATCH = 10

const PARTIAL_PREFIX_SYMBOL_MATCH = 1.5
const PARTIAL_PREFIX_NAME_MATCH = 2
const PARTIAL_MEASURE_SYMBOL_MATCH = 1.8
const PARTIAL_MEASURE_NAME_MATCH = 2

const MAX_LEVENSHTEIN_DISTANCE = 3

const END_ON_PREFIX_PENALTY = 0.1
const CASE_MISMATCH_PENALTY = 0.283

const POWER_MATCH_SCORE = 1.5

function mapLinear(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

/**
 * Checks if the 'rest' string starts with any amount of the 'potential match' string.
 * Returns the longest matching prefix, or null if no match is found.
 *
 * Score is based on the perfectMatchScore if a perfect match, or partialMatchScore scaled from 1 to partialMatchScore based on the amount of matching.
 *
 * TODO: Score based on levenshtein distance
 */
function getPartialMatch(
  rest: string,
  potentialMatch: string,
  testingMeasure: boolean,
  testingName: boolean,
  perfectMatchScore: number,
  partialMatchScore: number,
): { score: number; match: string } {
  // const lowerRest = rest.toLowerCase();
  // const lowerPotential = potentialMatch.toLowerCase();

  // Perfect prefix plural match, only for the measure
  if (testingMeasure) {
    const pluralMatch = `${potentialMatch}s`
    if (rest.startsWith(pluralMatch)) {
      // console.log(
      //   `${testingMeasure ? "measure" : "prefix"} ${testingName ? "name" : "symbol"}: perfect plural prefix match ${rest} to ${potentialMatch} with score ${perfectMatchScore}`
      // );

      return {
        score: perfectMatchScore,
        match: rest.slice(0, pluralMatch.length),
      }
    }
  }

  // Perfect prefix match
  if (rest.startsWith(potentialMatch)) {
    // console.log(
    //   `${testingMeasure ? "measure" : "prefix"} ${testingName ? "name" : "symbol"}: perfect prefix match ${rest} to ${potentialMatch} with score ${perfectMatchScore}`
    // );
    return {
      score: perfectMatchScore,
      match: rest.slice(0, potentialMatch.length),
    }
  }

  // Partial prefix match
  for (let i = potentialMatch.length; i > 0; i--) {
    if (rest.startsWith(potentialMatch.slice(0, i))) {
      const score = mapLinear(i, 0, potentialMatch.length, 1, partialMatchScore)
      // console.log(
      //   `${testingMeasure ? "measure" : "prefix"} ${testingName ? "name" : "symbol"}: partial prefix match ${rest} to ${potentialMatch} with subset ${potentialMatch.slice(0, i)} with score ${score}`
      // );

      return { score, match: rest.slice(0, i) }
    }
  }

  // Compare the levenshtein distance of the entire rest, and if it's low, allow that
  const levenshteinDistance = levenshtein(rest, potentialMatch)

  if (testingMeasure && levenshteinDistance <= MAX_LEVENSHTEIN_DISTANCE) {
    // console.log(
    //   `${testingMeasure ? "measure" : "prefix"} ${testingName ? "name" : "symbol"}: levenshteinDistance ${rest} to ${potentialMatch} is ${levenshteinDistance}`
    // );
    // Remap the distance to a score between 1 and the partialMatchScore
    const score = mapLinear(levenshteinDistance, MAX_LEVENSHTEIN_DISTANCE, 0, 0, partialMatchScore)

    // Consume the rest of the string
    return { score, match: rest }
  }

  // No match
  return { score: 0, match: "" }
}

function levenshtein(
  a: string,
  b: string,
  insertCost: number = 3,
  deleteCost: number = 2,
  substituteCost: number = 1,
): number {
  const an = a ? a.length : 0
  const bn = b ? b.length : 0

  if (an === 0) {
    return bn * insertCost
  }
  if (bn === 0) {
    return an * deleteCost
  }

  const matrix = new Array<number[]>(bn + 1)
  for (let i = 0; i <= bn; ++i) {
    const row = (matrix[i] = new Array<number>(an + 1))
    row[0] = i * insertCost
  }

  const firstRow = matrix[0]
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j * deleteCost
  }

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + substituteCost, // substitution
          matrix[i][j - 1] + insertCost, // insertion
          matrix[i - 1][j] + deleteCost, // deletion
        )
      }
    }
  }

  return matrix[bn][an]
}

function partialParse(
  partial: CompoundUnitPredictionWithDenominator,
  rest: string,
  key: "unit" | "over",
  depth: number,
): CompoundUnitPredictionWithDenominator[] {
  // All the combined results of this path
  const results: CompoundUnitPredictionWithDenominator[] = []
  const restNoSpacesAtStart = rest.replace(/^ */, "")
  const restLowerCase = restNoSpacesAtStart.toLowerCase()

  if (restNoSpacesAtStart.length === 0) {
    return [partial]
  }
  // console.log(`parsing ${rest} with partial`, partial);

  // If the partial does not contain any prefix, or measure yet
  if (!partial[key]?.prefix && !partial[key]?.measure) {
    // For each prefix, check if the rest matches, and if so, add the results of the recursive parse
    for (const prefix of prefixes) {
      // Matching cases
      const prefixNameMatch = getPartialMatch(
        restNoSpacesAtStart,
        prefix.name,
        false,
        true,
        PERFECT_PREFIX_NAME_MATCH,
        PARTIAL_PREFIX_NAME_MATCH,
      )

      if (prefixNameMatch.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], prefix },
              score: (partial.score ?? 1) * prefixNameMatch.score,
            },
            restNoSpacesAtStart.slice(prefixNameMatch.match.length),
            key,
            depth + 1,
          ),
        )
      }

      const prefixSymbolMatch = getPartialMatch(
        restNoSpacesAtStart,
        prefix.symbol,
        false,
        false,
        PERFECT_PREFIX_SYMBOL_MATCH,
        PARTIAL_PREFIX_SYMBOL_MATCH,
      )

      if (prefixSymbolMatch.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], prefix },
              score: (partial.score ?? 1) * prefixSymbolMatch.score,
            },
            restNoSpacesAtStart.slice(prefixSymbolMatch.match.length),
            key,
            depth + 1,
          ),
        )
      }

      // Case insensitive matches
      const prefixNameMatchCaseInsensitive = getPartialMatch(
        restLowerCase,
        prefix.name.toLowerCase(),
        false,
        true,
        PERFECT_PREFIX_NAME_MATCH,
        PARTIAL_PREFIX_NAME_MATCH,
      )

      if (prefixNameMatchCaseInsensitive.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], prefix },
              score: (partial.score ?? 1) * prefixNameMatchCaseInsensitive.score * CASE_MISMATCH_PENALTY,
            },
            restLowerCase.slice(prefixNameMatchCaseInsensitive.match.length),
            key,
            depth + 1,
          ),
        )
      }

      const prefixSymbolMatchCaseInsensitive = getPartialMatch(
        restLowerCase,
        prefix.symbol.toLowerCase(),
        false,
        false,
        PERFECT_PREFIX_SYMBOL_MATCH,
        PARTIAL_PREFIX_SYMBOL_MATCH,
      )

      if (prefixSymbolMatchCaseInsensitive.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], prefix },
              score: (partial.score ?? 1) * prefixSymbolMatchCaseInsensitive.score * CASE_MISMATCH_PENALTY,
            },
            restLowerCase.slice(prefixSymbolMatchCaseInsensitive.match.length),
            key,
            depth + 1,
          ),
        )
      }
    }
  }

  // If the partial does not contain any measure, then we can branch via measure
  if (!partial[key]?.measure) {
    for (const measure of measures) {
      const measureNameMatch = getPartialMatch(
        restNoSpacesAtStart,
        measure.name,
        true,
        true,
        PERFECT_MEASURE_NAME_MATCH,
        PARTIAL_MEASURE_NAME_MATCH,
      )

      if (measureNameMatch.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], measure },
              score: (partial.score ?? 1) * measureNameMatch.score,
            },
            restNoSpacesAtStart.slice(measureNameMatch.match.length),
            key,
            depth + 1,
          ),
        )
      }

      const measureSymbolMatch = getPartialMatch(
        restNoSpacesAtStart,
        measure.symbol,
        false,
        false,
        PERFECT_MEASURE_SYMBOL_MATCH,
        PARTIAL_MEASURE_SYMBOL_MATCH,
      )

      if (measureSymbolMatch.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], measure },
              score: (partial.score ?? 1) * measureSymbolMatch.score,
            },
            restNoSpacesAtStart.slice(measureSymbolMatch.match.length),
            key,
            depth + 1,
          ),
        )
      }

      // Case insensitive matches
      const measureNameMatchCaseInsensitive = getPartialMatch(
        restLowerCase,
        measure.name.toLowerCase(),
        true,
        true,
        PERFECT_MEASURE_NAME_MATCH,
        PARTIAL_MEASURE_NAME_MATCH,
      )

      if (measureNameMatchCaseInsensitive.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], measure },
              score: (partial.score ?? 1) * measureNameMatchCaseInsensitive.score * CASE_MISMATCH_PENALTY,
            },
            restLowerCase.slice(measureNameMatchCaseInsensitive.match.length),
            key,
            depth + 1,
          ),
        )
      }

      const measureSymbolMatchCaseInsensitive = getPartialMatch(
        restLowerCase,
        measure.symbol.toLocaleLowerCase(),
        false,
        false,
        PERFECT_MEASURE_SYMBOL_MATCH,
        PARTIAL_MEASURE_SYMBOL_MATCH,
      )

      if (measureSymbolMatchCaseInsensitive.score > 0) {
        results.push(
          ...partialParse(
            {
              ...partial,
              [key]: { ...partial[key], measure },
              score: (partial.score ?? 1) * measureSymbolMatchCaseInsensitive.score * CASE_MISMATCH_PENALTY,
            },
            restLowerCase.slice(measureSymbolMatchCaseInsensitive.match.length),
            key,
            depth + 1,
          ),
        )
      }
    }
  }

  // Check if the rest starts with a number or a ^ then number
  const powerMatch = restNoSpacesAtStart.match(/^\^?(\d+)/)

  if (powerMatch) {
    const power = parseInt(powerMatch[1], 10)

    let measureToApplyTo = partial[key]?.measure?.measure ?? null
    const measurewithIdentifierss = partial[key]?.measure ?? null

    if (measureToApplyTo && measurewithIdentifierss) {
      const symbol = measureToApplyTo.symbol
      for (let index = 1; index < power; index++) {
        measureToApplyTo = measureToApplyTo.times(measureToApplyTo)
      }
      measureToApplyTo = measureToApplyTo.withIdentifiers(`${symbol}${superscriptNumber(power)}`)

      results.push(
        ...partialParse(
          {
            ...partial,
            [key]: {
              ...partial[key],
              measure: {
                measure: measureToApplyTo,
                name: `${measurewithIdentifierss.name}^${power}`,
                symbol: `${measurewithIdentifierss.symbol}^${power}`,
              },
            },
            score: (partial.score ?? 1) * POWER_MATCH_SCORE,
          },
          restNoSpacesAtStart.slice(powerMatch[0].length),
          key,
          depth + 1,
        ),
      )
    }
  }

  if (results.length === 0) {
    // If we've parsed everything but there are still leftovers, this isn't a correct interpretation
    if (rest.length > 0) {
      return []
    }

    return [partial]
  }

  return postProcessOptions(results)
}

function postProcessOptions(results: CompoundUnitPredictionWithDenominator[]) {
  // Deduplicate results based on the names of the unit prefix and measure
  const uniqueResults = results.reduce((acc, current) => {
    const key = `${current.unit.prefix?.name || ""}-${current.unit.measure?.name || ""}-${current.over?.prefix?.name || ""}-${current.over?.measure?.name || ""}`
    if (!acc.has(key) || (current.score ?? 0) > (acc.get(key)?.score ?? 0)) {
      acc.set(key, current)
    }
    return acc
  }, new Map<string, CompoundUnitPredictionWithDenominator>())

  const uniqueResultsArray: CompoundUnitPredictionWithDenominator[] = []

  for (const result of Array.from(uniqueResults.values())) {
    // If the prediction ends on a prefix match, penalise it
    if ((result.unit.prefix && !result.unit.measure) || (result.over && result.over.prefix && !result.over.measure)) {
      result.score = (result.score ?? 1) * END_ON_PREFIX_PENALTY
    }

    // If the result is a prefix only on the numerator and a measure on the denominator, dump the prediction
    if (result.unit.prefix && !result.unit.measure && result.over?.measure) {
      continue
    }
    uniqueResultsArray.push(result)
  }

  // Sort the results by their scores
  return uniqueResultsArray.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export function parseCompoundUnit(input: string): CompoundUnitPredictionWithDenominator[] {
  // First check for a slash
  const slashIndex = input.indexOf("/")
  if (slashIndex !== -1) {
    const numeratorString = input.slice(0, slashIndex)
    const denominatorString = input.slice(slashIndex + 1)

    return partialParse({ unit: {} }, numeratorString, "unit", 0).flatMap(num =>
      partialParse({ ...num, over: {} }, denominatorString, "over", 0),
    )
  }

  // Check for a full ' per '
  const perIndex = input.indexOf(" per ")
  if (perIndex !== -1) {
    const numeratorString = input.slice(0, perIndex)
    const denominatorString = input.slice(perIndex + 5)
    return partialParse({ unit: {} }, numeratorString, "unit", 0).flatMap(num =>
      partialParse({ ...num, over: {} }, denominatorString, "over", 0),
    )
  }

  // Check for a 'p'
  const pIndex = input.indexOf("p")
  if (pIndex !== -1) {
    const numeratorString = input.slice(0, pIndex)
    const denominatorString = input.slice(pIndex + 1)
    return partialParse({ unit: {} }, numeratorString, "unit", 0).flatMap(num =>
      partialParse({ ...num, over: {} }, denominatorString, "over", 0),
    )
  }

  // Otherwise begin a partial parse without a denominator
  return partialParse({ unit: {} }, input, "unit", 0)
}

const corpus: {
  in: string
  options: CompoundUnitPredictionWithDenominatorTopK[]
}[] = [
  {
    in: "mbps",
    options: [
      {
        unit: { prefix: prefixesObject.mega, measure: measuresObject.bits },
        over: { measure: measuresObject.seconds },
        top: 1,
      },
    ],
  },
  // {
  //   in: "milli",
  //   options: [
  //     {
  //       unit: { prefix: prefixesObject.milli },
  //       top: 1,
  //     },
  //   ],
  // },
  // {
  //   in: "millilit",
  //   options: [
  //     {
  //       unit: { prefix: prefixesObject.milli, measure: measuresObject.liters },
  //       top: 1,
  //     },
  //   ],
  // },
  // {
  //   in: "miles per hour",
  //   options: [
  //     {
  //       unit: { measure: measuresObject.miles },
  //       over: { measure: measuresObject.hours },
  //       top: 1,
  //     },
  //   ],
  // },
  // {
  //   in: "MB/s",
  //   options: [
  //     {
  //       unit: { prefix: prefixesObject.mega, measure: measuresObject.bytes },
  //       over: { measure: measuresObject.seconds },
  //       top: 1,
  //     },
  //   ],
  // },
  // {
  //   in: "m",
  //   options: [
  //     { unit: { measure: measuresObject.meters }, top: 1 },
  //     { unit: { prefix: prefixesObject.milli } },
  //   ],
  // },
  // {
  //   in: "mm",
  //   options: [
  //     {
  //       unit: { prefix: prefixesObject.milli, measure: measuresObject.meters },
  //       top: 1,
  //     },
  //   ],
  // },
  // {
  //   in: "km/h",
  //   options: [
  //     {
  //       unit: { prefix: prefixesObject.kilo, measure: measuresObject.meters },
  //       over: { measure: measuresObject.hours },
  //     },
  //   ],
  // },
  // {
  //   in: "m/s^2",
  //   options: [
  //     {
  //       unit: { measure: measuresObject.meters },
  //       over: { measure: measuresObject.seconds, exponent: 2 },
  //     },
  //   ],
  // },
  // {
  //   in: "kg",
  //   options: [
  //     {
  //       unit: { measure: measuresObject.kilograms },
  //     },
  //   ],
  // },
  // {
  //   in: "mbps",
  //   options: [
  //     {
  //       unit: { prefix: prefixesObject.mega, measure: measuresObject.bits },
  //       over: { measure: measuresObject.seconds },
  //     },
  //   ],
  // },

  // iffy
  // {
  //   in: "mph",
  //   options: [
  //     {
  //       unit: { measure: measuresObject.miles },
  //       over: { measure: measuresObject.hours },
  //       top: 1,
  //     },
  //   ],
  // },
  // {
  //   in: "kph",
  //   options: [
  //     {
  //       unit: { prefix: prefixesObject.kilo, measure: measuresObject.meters },
  //       over: { measure: measuresObject.hours },
  //       top: 1,
  //     },
  //   ],
  // },
]

function stringRepr(result: CompoundUnitPredictionWithDenominator, withScore = false) {
  let res = "???"

  if (result.unit.measure) {
    // At least a measure has been found

    let compound = result.unit.measure.measure

    if (result.unit.prefix) {
      compound = result.unit.prefix.fn(compound)
    }

    if (result.unit.exponent) {
      const symbol = compound.symbol

      for (let index = 1; index < result.unit.exponent; index++) {
        compound = compound.times(compound)
      }
      compound = compound.withIdentifiers(`${symbol}${superscriptNumber(result.unit.exponent)}`)
    }

    if (result.over?.measure) {
      let over = result.over.measure.measure

      if (result.over.prefix) {
        over = result.over.prefix.fn(over)
      }

      if (result.over.exponent) {
        const symbol = over.symbol
        for (let index = 1; index < result.over.exponent; index++) {
          over = over.times(over)
        }
        over = over.withIdentifiers(`${symbol}${superscriptNumber(result.over.exponent)}`)
      }

      compound = compound.over(over).withIdentifiers(`${compound.symbol}/${over.symbol}`)
    }

    res = compound.symbol ?? "???"
  } else {
    // might be just a prefix

    if (result.unit.prefix) {
      res = `${result.unit.prefix.symbol}-?`
    }
  }

  return `${result.unit.prefix ? result.unit.prefix.name : ""}${result.unit.measure ? `${result.unit.measure.name}${result.unit.exponent ? `^${result.unit.exponent}` : ""}s` : ""}${result.over ? `/${result.over.prefix ? result.over.prefix.name : ""}${result.over.measure ? `${result.over.measure.name}${result.over.exponent ? `^${result.over.exponent}` : ""}` : ""}` : ""} - ${res}${withScore ? ` (${Math.round((result.score ?? 1) * 10) / 10})` : ""}`
}

describe(`parser`, () => {
  corpus.forEach(({ in: input, options }) => {
    it(`correctly parses "${input}"`, () => {
      const results = parseCompoundUnit(input)

      try {
        options.forEach(expected => {
          const resultIndex = results.findIndex(r => stringRepr(r) === stringRepr(expected))

          expect(resultIndex).not.toBe(-1)

          if (expected.top !== undefined) {
            expect(resultIndex).toBeLessThanOrEqual(expected.top - 1)
          }
        })
      } catch (err) {
        console.log(`Input: "${input}"`)
        console.log(
          `Possibilities: `,
          results.map(result => stringRepr(result, true)),
        )

        throw err
      }
    })
  })
})
