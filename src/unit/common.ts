import { Measure } from "../measure/numberMeasure"
import { kelvin, grams, meters, seconds } from "./base"
import { Area, Length, Mass, Temperature, Time } from "./quantities"

// Time
export const minutes: Time = Measure.from(60, seconds, "minute", "minutes", "min")
export const hours: Time = Measure.from(60, minutes, "hour", "hours", "hr")
export const days: Time = Measure.from(24, hours, "day", "days", "d")

// Length
export const inches: Length = Measure.from(0.0254, meters, "inch", "inches", "in")
export const thous: Length = Measure.from(0.001, inches, "thou", "thous", "th")
export const feet: Length = Measure.from(12, inches, "foot", "feet", "ft")
export const yards: Length = Measure.from(3, feet, "yard", "yards", "yd")
export const chains: Length = Measure.from(22, yards, "chain", "chains", "ch")
export const furlongs: Length = Measure.from(10, chains, "furlong", "furlongs", "fur")
export const miles: Length = Measure.from(8, furlongs, "mile", "miles", "mi")
export const leagues: Length = Measure.from(3, miles, "league", "leagues", "lea")
export const fathoms: Length = Measure.from(1.852, meters, "fathom", "fathoms", "ftm")
export const cables: Length = Measure.from(100, fathoms, "cable", "cables", "cable")
export const nauticalMiles: Length = Measure.from(10, cables, "nautical mile", "nautical miles", "nmi")
export const links: Length = Measure.from(7.92, inches, "link", "links", "li")
export const rods: Length = Measure.from(25, links, "rod", "rods", "rd")

// Area
export const perches: Area = rods.squared().withIdentifiers("perch", "perches", "perch")
export const roods: Area = furlongs.times(rods).withIdentifiers("rood", "roods", "rood")
export const acres: Area = furlongs.times(chains).withIdentifiers("acre", "acres", "acre")

// Mass
export const pounds: Mass = Measure.from(453.592_37, grams, "pound", "pounds", "lb")
export const grains: Mass = Measure.from(1 / 7000, pounds, "grain", "grains", "gr")
export const ounces: Mass = Measure.from(1 / 16, pounds, "ounce", "ounces", "oz")

// Temperature
export const celsius: Temperature = Measure.offsetFrom(
  kelvin, //
  1,
  273.15,
  "degree Celsius",
  "degrees Celsius",
  "°C",
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

export const fahrenheit: Temperature = Measure.offsetFrom(
  kelvin, //
  5 / 9,
  459.67,
  "degree Fahrenheit",
  "degrees Fahrenheit",
  "°F",
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
