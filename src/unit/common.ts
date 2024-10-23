import { Measure } from "../measure/numberMeasure"
import { NO_PREFIX_ALLOWED } from "../measure/prefixMask"
import { kelvin, grams, meters, seconds } from "./base"

// Time
export const minutes = Measure.from(60, seconds, "minute", "minutes", "min", NO_PREFIX_ALLOWED)
export const hours = Measure.from(60, minutes, "hour", "hours", "hr", NO_PREFIX_ALLOWED)
export const days = Measure.from(24, hours, "day", "days", "d", NO_PREFIX_ALLOWED)

// Length
export const inches = Measure.from(0.0254, meters, "inch", "inches", "in", NO_PREFIX_ALLOWED)
export const thous = Measure.from(0.001, inches, "thou", "thous", "th", NO_PREFIX_ALLOWED)
export const feet = Measure.from(12, inches, "foot", "feet", "ft", NO_PREFIX_ALLOWED)
export const yards = Measure.from(3, feet, "yard", "yards", "yd", NO_PREFIX_ALLOWED)
export const chains = Measure.from(22, yards, "chain", "chains", "ch", NO_PREFIX_ALLOWED)
export const furlongs = Measure.from(10, chains, "furlong", "furlongs", "fur", NO_PREFIX_ALLOWED)
export const miles = Measure.from(8, furlongs, "mile", "miles", "mi", NO_PREFIX_ALLOWED)
export const leagues = Measure.from(3, miles, "league", "leagues", "lea", NO_PREFIX_ALLOWED)
export const fathoms = Measure.from(1.852, meters, "fathom", "fathoms", "ftm", NO_PREFIX_ALLOWED)
export const cables = Measure.from(100, fathoms, "cable", "cables", "cable", NO_PREFIX_ALLOWED)
export const nauticalMiles = Measure.from(10, cables, "nautical mile", "nautical miles", "nmi", NO_PREFIX_ALLOWED)
export const links = Measure.from(7.92, inches, "link", "links", "li", NO_PREFIX_ALLOWED)
export const rods = Measure.from(25, links, "rod", "rods", "rd", NO_PREFIX_ALLOWED)

// Area
export const perches = rods.squared().withIdentifiers("perch", "perches", "perch", NO_PREFIX_ALLOWED)
export const roods = furlongs.times(rods).withIdentifiers("rood", "roods", "rood", NO_PREFIX_ALLOWED)
export const acres = furlongs.times(chains).withIdentifiers("acre", "acres", "acre", NO_PREFIX_ALLOWED)

// Mass
export const pounds = Measure.from(453.592_37, grams, "pound", "pounds", "lb", NO_PREFIX_ALLOWED)
export const grains = Measure.from(1 / 7000, pounds, "grain", "grains", "gr", NO_PREFIX_ALLOWED)
export const ounces = Measure.from(1 / 16, pounds, "ounce", "ounces", "oz", NO_PREFIX_ALLOWED)

// Temperature
export const celsius = Measure.offsetFrom(
  kelvin, //
  1,
  273.15,
  "degree Celsius",
  "degrees Celsius",
  "°C",
  NO_PREFIX_ALLOWED,
).superposition((root, leaf) => {
  if (root === leaf) {
    return Measure.offsetFrom(
      kelvin, //
      1,
      273.15,
      "degree Celsius",
      "degrees Celsius",
      "°C",
      NO_PREFIX_ALLOWED,
    )
  } else {
    return Measure.from(
      1,
      kelvin, //
      "degree Celsius difference",
      "degrees Celsius difference",
      "Δ°C",
      NO_PREFIX_ALLOWED,
    )
  }
})

export const fahrenheit = Measure.offsetFrom(
  kelvin, //
  5 / 9,
  459.67,
  "degree Fahrenheit",
  "degrees Fahrenheit",
  "°F",
  NO_PREFIX_ALLOWED,
).superposition((root, leaf) => {
  if (root === leaf) {
    return Measure.offsetFrom(
      kelvin, //
      5 / 9,
      459.67,
      "degree Fahrenheit",
      "degrees Fahrenheit",
      "°F",
      NO_PREFIX_ALLOWED,
    )
  } else {
    return Measure.from(
      5 / 9,
      kelvin, //
      "degree Fahrenheit difference",
      "degrees Fahrenheit difference",
      "Δ°F",
      NO_PREFIX_ALLOWED,
    )
  }
})
