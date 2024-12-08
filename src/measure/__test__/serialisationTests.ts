import { Measure } from "../numberMeasure"
import { UnitSystem } from "../unitSystem"

const ALLOW_SI_PREFIX = {
  PREFIX_SI: true,
} as const

const DISALLOW_PREFIXES = {
  PREFIX_SI: false,
} as const

const unitSystem = UnitSystem.from({
  length: "m",
  mass: "g",
  time: "s",
  temperature: "K",
})

const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_PREFIX)
const centi = Measure.prefix("centi", "c", 0.01, ALLOW_SI_PREFIX)
const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_PREFIX)
const micro = Measure.prefix("micro", "µ", 1e-6, ALLOW_SI_PREFIX)

const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX)
const gram = Measure.dimension(unitSystem, "mass", "gram", "grams", "g", ALLOW_SI_PREFIX)
const feet = Measure.from(0.3048, meters, "foot", "feet", "ft", DISALLOW_PREFIXES)
const inches = Measure.from(1 / 12, feet, "inch", "inches", "in", DISALLOW_PREFIXES)

const seconds = Measure.dimension(unitSystem, "time", "second", "seconds", "s", ALLOW_SI_PREFIX)
const minutes = Measure.from(60, seconds, "minute", "minutes", "m", DISALLOW_PREFIXES)
const hours = Measure.from(60, minutes, "hour", "hours", "hr", DISALLOW_PREFIXES)

const newtons = kilo(gram)
  .times(meters.per(seconds.squared()))
  .withIdentifiers("newton", "newtons", "N", ALLOW_SI_PREFIX)
const joules = newtons.times(meters).withIdentifiers("joule", "joules", "J", ALLOW_SI_PREFIX)

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
).redirectIfManipulated(
  Measure.from(
    1,
    kelvin, //
    "degree Celsius difference",
    "degrees Celsius difference",
    "Δ°C",
  ),
)

const fahrenheit = Measure.offsetFrom(
  kelvin, //
  5 / 9,
  459.67,
  "degree Fahrenheit",
  "degrees Fahrenheit",
  "°F",
).redirectIfManipulated(
  Measure.from(
    5 / 9,
    kelvin, //
    "degree Fahrenheit difference",
    "degrees Fahrenheit difference",
    "Δ°F",
  ),
)

describe("Serialisation tests", () => {
  const corpus: {
    measure: Measure<any, any, any>
    pluralName: string
    singularName: string
    symbol: string
  }[] = [
    {
      measure: meters, // simple
      pluralName: "meters",
      singularName: "meter",
      symbol: "m",
    },
    {
      measure: milli(meters), // prefix handling
      pluralName: "millimeters",
      singularName: "millimeter",
      symbol: "mm",
    },
    {
      measure: meters.pow(2).over(gram.times(seconds)),
      pluralName: "meters squared per (gram second)", // gram second vs second gram is interesting?
      singularName: "meter squared per (gram second)",
      symbol: "m²/(g·s)",
    },
    {
      measure: meters.pow(1).over(seconds.pow(6)),
      pluralName: "meters per second to the sixth",
      singularName: "meter per second to the sixth",
      symbol: "m/s⁶", // to the 1 is dropped to nothing
    },
    {
      measure: kilo(joules).per(celsius),
      pluralName: "kilojoules per degree Celsius difference",
      singularName: "kilojoule per degree Celsius difference",
      symbol: "kJ/Δ°C",
    },
    {
      measure: celsius,
      pluralName: "degrees Celsius",
      singularName: "degree Celsius",
      symbol: "°C",
    },
    {
      measure: celsius.per(seconds),
      pluralName: "degrees Celsius difference per second",
      singularName: "degree Celsius difference per second",
      symbol: "Δ°C/s",
    },
  ]

  for (const example of corpus) {
    it(`it correctly handles naming and symbols for ${example.pluralName} after passing a serialisation boundary`, () => {
      const symbolFormatter = Measure.createMeasureFormatter()
      const symbolName = example.measure.format(false, symbolFormatter)

      const nameFormatter = Measure.createMeasureFormatter({
        unitText: "name",
        times: " ",
        per: " per ",
        pow: "name",
        parentheses: false,
      })
      const pluralName = example.measure.format(true, nameFormatter)
      const singularName = example.measure.format(false, nameFormatter)

      const copiedAcrossBoundary = Measure.deserialise(example.measure.serialise())

      const copiedSymbolName = copiedAcrossBoundary.format(false, symbolFormatter)
      const copiedPluralName = copiedAcrossBoundary.format(true, nameFormatter)
      const copiedSingularName = copiedAcrossBoundary.format(false, nameFormatter)

      expect(symbolName).toBe(example.symbol)
      expect(pluralName).toBe(example.pluralName)
      expect(singularName).toBe(example.singularName)

      expect(symbolName).toBe(copiedSymbolName)
      expect(pluralName).toBe(copiedPluralName)
      expect(singularName).toBe(copiedSingularName)
    })
  }
})
