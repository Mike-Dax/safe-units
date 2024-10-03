import { Measure } from "../measure/numberMeasure"
import { meters } from "./base"
import { grains, grams, inches, pounds } from "./common"
import { micro } from "./metric"
import { liters } from "./other"
import { Length, Mass, Volume } from "./quantities"

// Length
export const points: Length = Measure.of(352.778, micro(meters), "point", "points", "p")
export const picas: Length = Measure.of(12, points, "pica", "picas", "pica")

// Liquid volume
export const minims: Volume = Measure.of(61.611_519_921_875, micro(liters), "minim", "minims", "min")
export const fluidDrams: Volume = Measure.of(60, minims, "fluid dram", "fluid drams", "fl dr")
export const teaspoons: Volume = Measure.of(80, minims, "teaspoon", "teaspoons", "tsp")
export const tablespoons: Volume = Measure.of(3, teaspoons, "tablespoon", "tablespoons", "Tbsp")
export const fluidOunces: Volume = Measure.of(2, tablespoons, "fluid ounce", "fluid ounces", "fl oz")
export const shots: Volume = Measure.of(3, tablespoons, "shot", "shots", "jig")
export const gills: Volume = Measure.of(4, fluidOunces, "gill", "gills", "gi")
export const cups: Volume = Measure.of(2, gills, "cup", "cups", "cp")
export const pints: Volume = Measure.of(2, cups, "pint", "pints", "pt")
export const quarts: Volume = Measure.of(2, pints, "quart", "quarts", "qt")
export const gallons: Volume = Measure.of(4, quarts, "gallon", "gallons", "gal")
export const barrels: Volume = Measure.of(31.5, gallons, "liquid barrel", "liquid barrels", "liq bbl")
export const oilBarrels: Volume = Measure.of(42, gallons, "oil barrel", "oil barrels", "bbl")
export const hogsheads: Volume = Measure.of(63, gallons, "hogshead", "hogsheads", "hogshead")

// Dry volume
export const dryPints: Volume = Measure.of(0.550_610_471_3575, liters, "dry pint", "dry pints", "dry pt")
export const dryQuarts: Volume = Measure.of(2, dryPints, "dry quart", "dry quarts", "dry qt")
export const dryGallons: Volume = Measure.of(4, dryQuarts, "dry gallon", "dry gallons", "dry gal")
export const pecks: Volume = Measure.of(2, dryGallons, "peck", "pecks", "pk")
export const bushels: Volume = Measure.of(4, pecks, "bushel", "bushels", "bu")
export const dryBarrels: Volume = Measure.of(7056, inches.cubed(), "dry barrel", "dry barrels", "dry bbl")

// Mass
export const drams: Mass = Measure.of(1.771_845_195_3125, grams, "dram", "drams", "dr")
export const pennyweights: Mass = Measure.of(24, grains, "pennyweight", "pennyweights", "dwt")
export const hundredweights: Mass = Measure.of(100, pounds, "hundredweight", "hundredweights", "cwd")
export const tons: Mass = Measure.of(2000, pounds, "ton", "tons", "ton")
