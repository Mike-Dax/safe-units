import { createAutoCompleter, Result } from "../autocomplete"
import { Measure } from "../numberMeasure"
import { UnitSystem } from "../unitSystem"

// Prefixes
const ALLOW_SI_SUBMULTIPLE_PREFIX = {
  PREFIX_SI_SUBMULTIPLE: true,
} as const
const ALLOW_SI_MULTIPLE_PREFIX = {
  PREFIX_SI_MULTIPLE: true,
} as const
const ALLOW_SI_PREFIX = {
  PREFIX_SI_SUBMULTIPLE: true,
  PREFIX_SI_MULTIPLE: true,
} as const
const ALLOW_BINARY_MULTIPLE_PREFIX = {
  PREFIX_BINARY_MULTIPLE: true,
} as const

const DISALLOW_PREFIXES = {} as const

const unitSystem = UnitSystem.from({
  length: "m",
  mass: "g",
  time: "s",
  temperature: "K",
  memory: "b",
})

const mega = Measure.prefix("mega", "M", 1e6, ALLOW_SI_MULTIPLE_PREFIX)
const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_MULTIPLE_PREFIX)
const centi = Measure.prefix("centi", "c", 0.01, ALLOW_SI_MULTIPLE_PREFIX)
const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_SUBMULTIPLE_PREFIX)
const micro = Measure.prefix("micro", "µ", 1e-6, ALLOW_SI_SUBMULTIPLE_PREFIX)

const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX)
const grams = Measure.dimension(unitSystem, "mass", "gram", "grams", "g", ALLOW_SI_PREFIX)
const feet = Measure.from(0.3048, meters, "foot", "feet", "ft", DISALLOW_PREFIXES)
const inches = Measure.from(1 / 12, feet, "inch", "inches", "in", DISALLOW_PREFIXES)

const seconds = Measure.dimension(unitSystem, "time", "second", "seconds", "s", ALLOW_SI_PREFIX)
const minutes = Measure.from(60, seconds, "minute", "minutes", "m", DISALLOW_PREFIXES)
const hours = Measure.from(60, minutes, "hour", "hours", "hr", DISALLOW_PREFIXES)

const newtons = kilo(grams)
  .times(meters.per(seconds.squared()))
  .withIdentifiers("newton", "newtons", "N", ALLOW_SI_PREFIX)
const joules = newtons.times(meters).withIdentifiers("joule", "joules", "J", ALLOW_SI_PREFIX)

const bits = Measure.dimension(unitSystem, "memory", "bit", "bits", "b", ALLOW_SI_MULTIPLE_PREFIX)

const bytes = Measure.from(8, bits, "byte", "bytes", "B", {
  PREFIX_BINARY_MULTIPLE: true,
  PREFIX_SI_MULTIPLE: true, // Also allow 'kilo' bytes, etc
})

const kibi = Measure.prefix("kibi", "Ki", 1 << 10, ALLOW_BINARY_MULTIPLE_PREFIX)
const mebi = Measure.prefix("mebi", "Mi", 1 << 20, ALLOW_BINARY_MULTIPLE_PREFIX)
const gibi = Measure.prefix("gibi", "Gi", 1 << 30, ALLOW_BINARY_MULTIPLE_PREFIX)
const tebi = Measure.prefix("tebi", "Ti", 1 << 40, ALLOW_BINARY_MULTIPLE_PREFIX)
const pibi = Measure.prefix("pibi", "Pi", 1 << 50, ALLOW_BINARY_MULTIPLE_PREFIX)
const exbi = Measure.prefix("exbi", "Ei", 1 << 60, ALLOW_BINARY_MULTIPLE_PREFIX)
const zebi = Measure.prefix("zebi", "Zi", 1 << 70, ALLOW_BINARY_MULTIPLE_PREFIX)
const yobi = Measure.prefix("yobi", "Yi", 1 << 80, ALLOW_BINARY_MULTIPLE_PREFIX)

const kelvin = Measure.dimension(
  unitSystem, //
  "temperature",
  "kelvin",
  "kelvins",
  "K",
  ALLOW_SI_PREFIX,
)

const celsius = Measure.offsetFrom(
  kelvin, //
  1,
  273.15,
  "degree Celsius",
  "degrees Celsius",
  "°C",
  DISALLOW_PREFIXES,
).superposition((root, leaf) => {
  if (root === leaf) {
    return Measure.offsetFrom(
      kelvin, //
      1,
      273.15,
      "degree Celsius",
      "degrees Celsius",
      "°C",
    )
  } else {
    return Measure.from(
      1,
      kelvin, //
      "degree Celsius difference",
      "degrees Celsius difference",
      "Δ°C",
    )
  }
})

const fahrenheit = Measure.offsetFrom(
  kelvin, //
  5 / 9,
  459.67,
  "degree Fahrenheit",
  "degrees Fahrenheit",
  "°F",
  DISALLOW_PREFIXES,
).superposition((root, leaf) => {
  if (root === leaf) {
    return Measure.offsetFrom(
      kelvin, //
      5 / 9,
      459.67,
      "degree Fahrenheit",
      "degrees Fahrenheit",
      "°F",
    )
  } else {
    return Measure.from(
      5 / 9,
      kelvin, //
      "degree Fahrenheit difference",
      "degrees Fahrenheit difference",
      "Δ°F",
    )
  }
})

const autocompleter = createAutoCompleter(
  [meters, grams, feet, inches, seconds, minutes, hours, newtons, joules, kelvin, celsius, fahrenheit, bits, bytes],
  [kilo, centi, milli, micro, kibi, mebi, gibi, tebi, pibi, exbi, zebi, yobi, mega],
  [
    { measure: celsius, text: ["Celsius", "degrees", "degrees C"] },
    { measure: kilo(meters), text: ["k"] },
  ],
)

const symbolFormatter = Measure.createMeasureFormatter()
const nameFormatter = Measure.createMeasureFormatter({
  unitText: "name",
  times: " ",
  per: " per ",
  pow: "name",
  parentheses: false,
})

describe("Autocomplete candidates", () => {
  const corpus: {
    queries: string[]
    candidate: Measure<any, any, any>
    top?: number
    nonCandidates?: Measure<any, any, any>[]
  }[] = [
    {
      queries: ["m", "meter", "metre", "meters", "metres"],
      candidate: meters,
      top: 1,
    },
    {
      queries: ["mm", "millimeter", "millimetre", "millimeters", "millimetres", "millime", "millimete"],
      candidate: milli(meters),
      top: 1,
    },
    {
      queries: ["millimeter kilograms per second", "mm kg / s"],
      candidate: milli(meters).times(kilo(grams)).per(seconds),
      top: 1,
    },
    {
      queries: ["kph", "km/h", "kmph", "km/hr", "kilometers per hour", "km per hour"],
      candidate: kilo(meters).per(hours),
      top: 1,
    },
    {
      queries: ["C", "celsius", "degrees C", "deg C", "°C", "degrees celsius"],
      candidate: celsius,
      top: 1,
    },
    {
      queries: ["MBps", "MB/s", "MB / s", "MB /s", "MB/ s", "megabyte per second"],
      candidate: mega(bytes).per(seconds),
      top: 1,
    },
    {
      queries: ["mbps", "Mb/s"],
      candidate: mega(bits).per(seconds),
      top: 1,
    },
    {
      queries: ["m/s^2", "m/s²", "meters per second squared"],
      candidate: meters.per(seconds.squared()),
      top: 1,
    },
    {
      queries: ["m^2/s", "m²/s", "meters squared per second"],
      candidate: meters.squared().per(seconds),
      top: 1,
    },
    {
      queries: ["meters sq", "meters squa", "meters squared"],
      candidate: meters.squared(),
      top: 1,
    },
    {
      queries: ["m^3/g", "m³/g", "meters cubed per gram"],
      candidate: meters.cubed().per(grams),
      top: 1,
    },
  ]

  for (const example of corpus) {
    for (const query of example.queries) {
      it(`predicts ${stringifyUnit(example.candidate)} ${example.top ? `in top ${example.top} result${example.top > 1 ? "s" : ""} ` : ``}for query "${query}"`, () => {
        const results = autocompleter(query)

        if (results.length === 0) {
          throw new Error(`No results`)
        }

        const candidateName = example.candidate.format(true, nameFormatter)
        const candidateIndex = results.findIndex(result => result.measure.format(true, nameFormatter) === candidateName)

        if (candidateIndex === -1) {
          throw new Error(
            `Candidate ${stringifyUnit(example.candidate)} not in results: [${results.map(result => stringifyUnit(result.measure)).join(", ")}]`,
          )
        }

        if (example.top !== undefined) {
          if (candidateIndex + 1 > example.top) {
            throw new Error(
              `Found candidate ${stringifyUnit(example.candidate)} at position ${candidateIndex + 1} when it was expected to be within the top ${example.top}:\n\n ${stringifyResultsList(results, example.candidate)}`,
            )
          }
        }

        if (example.nonCandidates) {
          for (const nonCandidate of example.nonCandidates) {
            const nonCandidateName = nonCandidate.format(true, nameFormatter)
            const nonCandidateIndex = results.findIndex(
              result => result.measure.format(true, nameFormatter) === nonCandidateName,
            )
            expect(nonCandidateIndex).toBe(-1)
          }
        }
      })
    }
  }
})

function stringifyUnit(measure: Measure<any, any, any>) {
  const candidatePluralName = measure.format(true, nameFormatter)
  const candidateSymbol = measure.format(true, symbolFormatter)

  return `${candidatePluralName} (${candidateSymbol})`
}

function stringifyResultsList(results: Result[], highlight?: Measure<any, any, any>) {
  const totalNumResults = results.length

  function padPos(index: number) {
    const numDigits = totalNumResults.toString().length
    return index.toString().padStart(numDigits, " ")
  }

  const highlit = highlight ? stringifyUnit(highlight) : null

  function highlightIfMatch(measure: Measure<any, any, any>) {
    const str = stringifyUnit(measure)

    if (str === highlit) {
      return `\x1b[31m\x1b[31m${str}\x1b[0m\x1b[0m`
    } else {
      return str
    }
  }

  return `[\n   ${results.map((result, index) => `${padPos(index)} - ${highlightIfMatch(result.measure)}`).join(",\n   ")}\n ]`
}
