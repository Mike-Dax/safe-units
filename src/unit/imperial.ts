import { Measure } from "../measure/numberMeasure"
import { grains, inches, pounds } from "./common"
import { Mass, Volume } from "./quantities"

// Liquid Volume
export const fluidOunces: Volume = Measure.from(1.7339, inches.cubed(), "fluid ounce", "fluid ounces", "fl oz")
export const gills: Volume = Measure.from(5, fluidOunces, "gill", "gills", "gi")
export const pints: Volume = Measure.from(20, fluidOunces, "pint", "pints", "pt")
export const quarts: Volume = Measure.from(2, pints, "quart", "quarts", "qt")
export const gallons: Volume = Measure.from(4, quarts, "gallon", "gallons", "gal")

// Mass
export const drachms: Mass = Measure.from(1 / 256, grains, "drachm", "drachms", "dr")
export const stone: Mass = Measure.from(14, pounds, "stone", "stone", "st")
export const quarters: Mass = Measure.from(2, stone, "quarter", "quarters", "qtr")
export const hundredweights: Mass = Measure.from(112, pounds, "hundredweight", "hundredweights", "cwt")
export const tons: Mass = Measure.from(2240, pounds, "ton", "tons", "t")
