import { Measure } from "../measure/numberMeasure"
import { grains, inches, pounds } from "./common"
import { Mass, Volume } from "./quantities"

// Liquid Volume
export const fluidOunces: Volume = Measure.of(1.7339, inches.cubed(), "fluid ounce", "fluid ounces", "fl oz")
export const gills: Volume = Measure.of(5, fluidOunces, "gill", "gills", "gi")
export const pints: Volume = Measure.of(20, fluidOunces, "pint", "pints", "pt")
export const quarts: Volume = Measure.of(2, pints, "quart", "quarts", "qt")
export const gallons: Volume = Measure.of(4, quarts, "gallon", "gallons", "gal")

// Mass
export const drachms: Mass = Measure.of(1 / 256, grains, "drachm", "drachms", "dr")
export const stone: Mass = Measure.of(14, pounds, "stone", "stone", "st")
export const quarters: Mass = Measure.of(2, stone, "quarter", "quarters", "qtr")
export const hundredweights: Mass = Measure.of(112, pounds, "hundredweight", "hundredweights", "cwt")
export const tons: Mass = Measure.of(2240, pounds, "ton", "tons", "t")
