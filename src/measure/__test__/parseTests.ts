import { Measure } from "../numberMeasure";

import { meters, kilograms, seconds, amperes, kelvin, moles, candelas, radians, steradians, bits } from "../../unit";
import { hertz, newtons, pascals, joules, watts, volts, coulombs, farads, ohms, siemens, henrys, webers, teslas, sieverts, katals, lumens, luxes } from "../../unit/metric";
import { liters, speedOfLight, bars, atmospheres, torrs } from "../../unit/other";
import { bytes } from "../../unit/memory";
import { minutes, hours, days, inches, feet, yards, miles, nauticalMiles, acres, pounds, ounces } from "../../unit/common";
import { degrees, arcMinutes, arcSeconds } from "../../unit/angle";


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
} from "../../unit/metric";

import {
  kibi,
  mebi,
  gibi,
  tebi,
  pibi,
  exbi,
  zebi,
  yobi,
} from "../../unit/memory";
import { PrefixFn } from "../genericMeasureUtils";


export type PrefixWithIdentifiers = {
  fn: PrefixFn,
  symbol: string,
  name: string
}

export type MeasureWithIdentifiers = {
  measure: Measure<any, any>,
  symbol: string,
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

const prefixes: PrefixWithIdentifiers[] = Object.values(prefixesObject);





const measuresObject = {
  meters: { measure: meters, symbol: "m", name: "meter" },
  kilograms: { measure: kilograms, symbol: "kg", name: "kilogram" },
  seconds: { measure: seconds, symbol: "s", name: "second" },
  amperes: { measure: amperes, symbol: "A", name: "ampere" },
  kelvins: { measure: kelvin, symbol: "K", name: "kelvin" },
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
  nauticalMiles: { measure: nauticalMiles, symbol: "nmi", name: "nautical mile" },
  acres: { measure: acres, symbol: "acre", name: "acre" },
  pounds: { measure: pounds, symbol: "lb", name: "pound" },
  ounces: { measure: ounces, symbol: "oz", name: "ounce" },
  degrees: { measure: degrees, symbol: "deg", name: "degree" },
  arcMinutes: { measure: arcMinutes, symbol: "arcmin", name: "arcminute" },
  arcSeconds: { measure: arcSeconds, symbol: "arcsec", name: "arcsecond" },
} as const

const measures: MeasureWithIdentifiers[] = Object.values(measuresObject);

/**
 * If a compound unit prediction has no prefix, then there is certainly no prefix.
 * However if it has no measure, then any measure is possible.
 */
export type CompoundUnitPrediction = {
  prefix?: PrefixWithIdentifiers
  measure?: MeasureWithIdentifiers
}

export type CompoundUnitPredictionWithDenominator = { unit: CompoundUnitPrediction, over?: CompoundUnitPrediction, score?: number, leftovers?: string }

const PERFECT_PREFIX_SYMBOL_MATCH = 5
const PERFECT_PREFIX_NAME_MATCH = 10
const PERFECT_MEASURE_SYMBOL_MATCH = 5
const PERFECT_MEASURE_NAME_MATCH = 10

const PARTIAL_PREFIX_SYMBOL_MATCH = 1.5
const PARTIAL_PREFIX_NAME_MATCH = 2
const PARTIAL_MEASURE_SYMBOL_MATCH = 1.8
const PARTIAL_MEASURE_NAME_MATCH = 2

const POWER_MATCH_SCORE = 1.5


function mapLinear(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * Checks if the 'rest' string starts with any amount of the 'potential match' string.
 * Returns the longest matching prefix, or null if no match is found.
 * 
 * Score is based on the perfectMatchScore if a perfect match, or partialMatchScore scaled from 1 to partialMatchScore based on the amount of matching.
 * 
 * TODO: Score based on levenshtein distance
 */
function getPartialMatch(rest: string, potentialMatch: string, allowPlural: boolean, perfectMatchScore: number, partialMatchScore: number): { score: number, match: string } {
  // const lowerRest = rest.toLowerCase();
  // const lowerPotential = potentialMatch.toLowerCase();

  // Perfect prefix plural match
  if (allowPlural) {
    const pluralMatch = `${potentialMatch}s`;
    if (rest.startsWith(pluralMatch)) {
      console.log(`perfect match plural ${rest} to ${potentialMatch} scored as ${perfectMatchScore}`)
      return { score: perfectMatchScore, match: rest.slice(0, pluralMatch.length) };
    }
  }

  // Perfect prefix match
  if (rest.startsWith(potentialMatch)) {
    console.log(`perfect match ${rest} to ${potentialMatch} scored as ${perfectMatchScore}`)
    return { score: perfectMatchScore, match: rest.slice(0, potentialMatch.length) };
  }

  // Partial prefix match
  for (let i = potentialMatch.length; i > 0; i--) {
    if (rest.startsWith(potentialMatch.slice(0, i))) {
      const score = mapLinear(i, 0, potentialMatch.length, 1, partialMatchScore)

      console.log(`partial match ${rest} to ${potentialMatch} scored as ${score}`)

      return { score, match: rest.slice(0, i) };
    }
  }

  // TODO: Also compare the levenshtein distance and allow for typos.

  // No match
  return { score: 0, match: '' }
}

function bestMatch(a: { score: number, match: string }, b: { score: number, match: string }) {
  if (a.score > b.score) return a
  return b
}

function partialParse(
  partial: CompoundUnitPredictionWithDenominator,
  rest: string,
  depth: number
): CompoundUnitPredictionWithDenominator[] {
  // All the combined results of this path
  const results: CompoundUnitPredictionWithDenominator[] = [];
  const restNoSpacesAtStart = rest.replace(/^ */, "");

  if (restNoSpacesAtStart.length === 0) {
    return [partial]
  }

  // If the partial does not contain any prefix, then we can branch via prefix
  if (!partial.unit.prefix) {
    // For each prefix, check if the rest matches, and if so, add the results of the recursive parse
    for (const prefix of prefixes) {
      const prefixMatch = bestMatch(
        getPartialMatch(restNoSpacesAtStart, prefix.name, false, PERFECT_PREFIX_NAME_MATCH, PARTIAL_PREFIX_NAME_MATCH),
        getPartialMatch(restNoSpacesAtStart, prefix.symbol, false, PERFECT_PREFIX_SYMBOL_MATCH, PARTIAL_PREFIX_SYMBOL_MATCH)
      )

      if (prefixMatch) {
        results.push(...partialParse(
          { ...partial, unit: { ...partial.unit, prefix }, score: (partial.score ?? 1) * prefixMatch.score },
          restNoSpacesAtStart.slice(prefixMatch.match.length),
          depth + 1
        ));
      }
    }
  }

  // If the partial does not contain any measure, then we can branch via measure
  if (!partial.unit.measure) {
    for (const measure of measures) {

      const measureMatch = bestMatch(
        getPartialMatch(restNoSpacesAtStart, measure.name, true, PERFECT_MEASURE_NAME_MATCH, PARTIAL_MEASURE_NAME_MATCH),
        getPartialMatch(restNoSpacesAtStart, measure.symbol, true, PERFECT_MEASURE_SYMBOL_MATCH, PARTIAL_MEASURE_SYMBOL_MATCH)
      )

      if (measureMatch) {
        results.push(...partialParse(
          { ...partial, unit: { ...partial.unit, measure }, score: (partial.score ?? 1) * measureMatch.score },
          restNoSpacesAtStart.slice(measureMatch.match.length),
          depth + 1
        ));
      }
    }
  }

  // Check if the rest starts with a number or a ^ then number
  const powerMatch = restNoSpacesAtStart.match(/^\^?(\d+)/);

  if (powerMatch) {
    const power = parseInt(powerMatch[1], 10);

    let measureToApplyTo: Measure<any, any> | null = null
    let measureWithSymbols: MeasureWithIdentifiers | null = null

    if (partial.over && partial.over.measure) {
      measureToApplyTo = partial.over.measure.measure
      measureWithSymbols = partial.over.measure
    } else if (partial.unit.measure) {
      measureToApplyTo = partial.unit.measure.measure
      measureWithSymbols = partial.unit.measure
    }

    if (measureToApplyTo && measureWithSymbols) {
      for (let i = 1; i < power; i++) {
        measureToApplyTo = measureToApplyTo.times(measureToApplyTo);
      }
      results.push(...partialParse(
        {
          ...partial, over: {
            ...partial.over, measure: {
              measure: measureToApplyTo,
              name: `${measureWithSymbols.name}^${power}`,
              symbol: `${measureWithSymbols.symbol}^${power}`,
            }
          }, score: (partial.score ?? 1) * POWER_MATCH_SCORE
        },
        restNoSpacesAtStart.slice(powerMatch[0].length),
        depth + 1
      ));
    }
  }

  if (results.length === 0) {
    // If we've parsed everything but there are still leftovers, this isn't a correct interpretation
    if (rest.length > 0) {
      return []
    }

    return [partial]
  }

  return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export function parseCompoundUnit(input: string): CompoundUnitPredictionWithDenominator[] {

  // First check for a slash
  const slashIndex = input.indexOf('/');
  if (slashIndex !== -1) {
    const numeratorString = input.slice(0, slashIndex);
    const denominatorString = input.slice(slashIndex + 1);
    return partialParse({ unit: {} }, numeratorString, 0).flatMap(num =>
      partialParse({ ...num, over: {} }, denominatorString, 0)
    );
  }

  // Check for a full ' per '
  const perIndex = input.indexOf(' per ');
  if (perIndex !== -1) {
    const numeratorString = input.slice(0, perIndex);
    const denominatorString = input.slice(perIndex + 5);
    return partialParse({ unit: {} }, numeratorString, 0).flatMap(num =>
      partialParse({ ...num, over: {} }, denominatorString, 0)
    );
  }

  // Otherwise begin a partial parse
  return partialParse({ unit: {} }, input, 0);
}






const corpus: { in: string, options: CompoundUnitPredictionWithDenominator[] }[] = [
  // { in: "mil", options: [{ unit: { prefix: prefixesObject.milli } }] },
  // { in: "m", options: [
  //   { unit: { prefix: prefixesObject.milli } },
  //   { unit: { measure: measuresObject.meters } },
  //   { unit: { measure: measuresObject.minutes } },
  //   { unit: { measure: measuresObject.miles } },
  //   { unit: { measure: measuresObject.moles } },
  // ] },
  {
    in: "mm", options: [
      { unit: { prefix: prefixesObject.milli, measure: measuresObject.meters } },
    ]
  },


];


function stringRepr(result: CompoundUnitPredictionWithDenominator) {
  return `${result.unit.prefix ? result.unit.prefix.name : ''}${result.unit.measure ? result.unit.measure.name : ''}${result.over ? `${result.over.prefix ? result.over.prefix.name : ''}${result.over.measure ? result.over.measure.name : ''}` : ''} (${Math.round((result.score ?? 1) * 10) / 10})`
}

describe(`parser`, () => {
  corpus.forEach(({ in: input, options }) => {
    it(`correctly parses "${input}"`, () => {
      const results = parseCompoundUnit(input);

      console.log(`Input: "${input}"`);
      console.log(`Possibilities: `, results.map(result => stringRepr(result)))


      options.forEach(expected => {
        const matchingResult = results.find(r =>
          stringRepr(r) === stringRepr(expected)
        );

        expect(matchingResult).toBeDefined();
      });
    });
  });
});