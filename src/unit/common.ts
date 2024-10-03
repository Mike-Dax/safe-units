import { Measure } from "../measure/numberMeasure"
import { kilograms, meters, seconds } from "./base"
import { Area, Length, Mass, Time } from "./quantities"

// Time
export const minutes: Time = Measure.of(60, seconds, "minute", "minutes", "min")
export const hours: Time = Measure.of(60, minutes, "hour", "hours", "hr")
export const days: Time = Measure.of(24, hours, "day", "days", "d")

// Length
export const inches: Length = Measure.of(0.0254, meters, "inch", "inches", "in")
export const thous: Length = Measure.of(0.001, inches, "thou", "thous", "th")
export const feet: Length = Measure.of(12, inches, "foot", "feet", "ft")
export const yards: Length = Measure.of(3, feet, "yard", "yards", "yd")
export const chains: Length = Measure.of(22, yards, "chain", "chains", "ch")
export const furlongs: Length = Measure.of(10, chains, "furlong", "furlongs", "fur")
export const miles: Length = Measure.of(8, furlongs, "mile", "miles", "mi")
export const leagues: Length = Measure.of(3, miles, "league", "leagues", "lea")
export const fathoms: Length = Measure.of(1.852, meters, "fathom", "fathoms", "ftm")
export const cables: Length = Measure.of(100, fathoms, "cable", "cables", "cable")
export const nauticalMiles: Length = Measure.of(10, cables, "nautical mile", "nautical miles", "nmi")
export const links: Length = Measure.of(7.92, inches, "link", "links", "li")
export const rods: Length = Measure.of(25, links, "rod", "rods", "rd")

// Area
export const perches: Area = rods.squared().withIdentifiers("perch", "perches", "perch")
export const roods: Area = furlongs.times(rods).withIdentifiers("rood", "roods", "rood")
export const acres: Area = furlongs.times(chains).withIdentifiers("acre", "acres", "acre")

// Mass
export const grams: Mass = Measure.of(0.001, kilograms, "gram", "grams", "g")
export const pounds: Mass = Measure.of(453.592_37, grams, "pound", "pounds", "lb")
export const grains: Mass = Measure.of(1 / 7000, pounds, "grain", "grains", "gr")
export const ounces: Mass = Measure.of(1 / 16, pounds, "ounce", "ounces", "oz")
