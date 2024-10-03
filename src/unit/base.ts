import { GenericMeasureType } from "../measure"
import { Measure } from "../measure/numberMeasure"
import { UnitSystem } from "../measure/unitSystem"

const SIUnitSystemBasis = {
  length: "m",
  mass: "kg",
  time: "s",
  current: "A",
  temperature: "K",
  substance: "mol",
  intensity: "cd",
  planeAngle: "rad",
  solidAngle: "sr",
  memory: "b",
} as const

type SIUnitSystemBasis = typeof SIUnitSystemBasis

export interface SIUnitSystem extends SIUnitSystemBasis {}

export const SIUnitSystem = UnitSystem.from<SIUnitSystem>(SIUnitSystemBasis)

export const createSIBaseUnits = <N>(measure: GenericMeasureType<N, any>) => ({
  meters: measure.dimension(SIUnitSystem, "length", "meter", "meters", "m"),
  kilograms: measure.dimension(SIUnitSystem, "mass", "kilogram", "kilograms", "kg"),
  seconds: measure.dimension(SIUnitSystem, "time", "second", "seconds", "s"),
  amperes: measure.dimension(SIUnitSystem, "current", "ampere", "amperes", "A"),
  kelvin: measure.dimension(SIUnitSystem, "temperature", "kelvin", "kelvin", "K"),
  moles: measure.dimension(SIUnitSystem, "substance", "mole", "moles", "mol"),
  candelas: measure.dimension(SIUnitSystem, "intensity", "candela", "candelas", "cd"),
  radians: measure.dimension(SIUnitSystem, "planeAngle", "radian", "radians", "rad"),
  steradians: measure.dimension(SIUnitSystem, "solidAngle", "steradian", "steradians", "sr"),
  bits: measure.dimension(SIUnitSystem, "memory", "bit", "bits", "b"),
})

export const { meters, kilograms, seconds, amperes, kelvin, moles, candelas, radians, steradians, bits } =
  createSIBaseUnits(Measure)
