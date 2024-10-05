import { Measure } from "../measure/numberMeasure"
import { meters, seconds } from "./base"
import { grams } from "./common"
import { milli, nano, pascals } from "./metric"
import { Area, Length, Mass, Pressure, Velocity, Volume } from "./quantities"

// Mass
export const carats: Mass = Measure.from(200, milli(grams), "carat", "carats", "ct")

// Length
export const angstroms: Length = Measure.from(0.1, nano(meters), "angstrom", "angstroms", "Å")

// Area
export const ares: Area = Measure.from(100, meters.squared(), "are", "ares", "a")
export const hectares: Area = Measure.from(10000, meters.squared(), "hectare", "hectares", "ha")

// Volume
export const liters: Volume = Measure.from(0.001, meters.cubed(), "liter", "liters", "L")

// Velocity
export const speedOfLight: Velocity = Measure.from(
  299_792_458,
  meters.per(seconds),
  "times the speed of light",
  "times the speed of light",
  "C",
)

export const lights: Velocity = Measure.from(1, speedOfLight, "light", "lights", "C") // Alternative naming for speed of light

// Pressure
export const bars: Pressure = Measure.from(100_000, pascals, "bar", "bars", "bar")
export const atmospheres: Pressure = Measure.from(101_325, pascals, "atmosphere", "atmospheres", "atm")
export const torrs: Pressure = Measure.from(1 / 760, atmospheres, "torr", "torrs", "Torr")
