import { Measure } from "../measure/numberMeasure"
import { NO_PREFIX_ALLOWED } from "../measure/prefixMask"
import { grains, inches, pounds } from "./common"

// Liquid Volume
export const fluidOunces = Measure.from(
  1.7339,
  inches.cubed(),
  "fluid ounce",
  "fluid ounces",
  "fl oz",
  NO_PREFIX_ALLOWED,
)
export const gills = Measure.from(5, fluidOunces, "gill", "gills", "gi", NO_PREFIX_ALLOWED)
export const pints = Measure.from(20, fluidOunces, "pint", "pints", "pt", NO_PREFIX_ALLOWED)
export const quarts = Measure.from(2, pints, "quart", "quarts", "qt", NO_PREFIX_ALLOWED)
export const gallons = Measure.from(4, quarts, "gallon", "gallons", "gal", NO_PREFIX_ALLOWED)

// Mass
export const drachms = Measure.from(1 / 256, grains, "drachm", "drachms", "dr", NO_PREFIX_ALLOWED)
export const stone = Measure.from(14, pounds, "stone", "stone", "st", NO_PREFIX_ALLOWED)
export const quarters = Measure.from(2, stone, "quarter", "quarters", "qtr", NO_PREFIX_ALLOWED)
export const hundredweights = Measure.from(112, pounds, "hundredweight", "hundredweights", "cwt", NO_PREFIX_ALLOWED)
export const tons = Measure.from(2240, pounds, "ton", "tons", "t", NO_PREFIX_ALLOWED)
