import { GenericMeasureType } from "../measure"
import { Measure } from "../measure/numberMeasure"
import { UnitSystem } from "../measure/unitSystem"
import { ALLOW_SI_PREFIX } from "./metric"

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
  meters: measure.dimension(SIUnitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX),
  kilograms: measure.dimension(SIUnitSystem, "mass", "kilogram", "kilograms", "kg", ALLOW_SI_PREFIX),
  seconds: measure.dimension(SIUnitSystem, "time", "second", "seconds", "s", ALLOW_SI_PREFIX),
  amperes: measure.dimension(SIUnitSystem, "current", "ampere", "amperes", "A", ALLOW_SI_PREFIX),
  kelvin: measure.dimension(SIUnitSystem, "temperature", "kelvin", "kelvin", "K", ALLOW_SI_PREFIX),
  moles: measure.dimension(SIUnitSystem, "substance", "mole", "moles", "mol", ALLOW_SI_PREFIX),
  candelas: measure.dimension(SIUnitSystem, "intensity", "candela", "candelas", "cd", ALLOW_SI_PREFIX),
  radians: measure.dimension(SIUnitSystem, "planeAngle", "radian", "radians", "rad", ALLOW_SI_PREFIX),
  steradians: measure.dimension(SIUnitSystem, "solidAngle", "steradian", "steradians", "sr", ALLOW_SI_PREFIX),
  bits: measure.dimension(SIUnitSystem, "memory", "bit", "bits", "b", ALLOW_SI_PREFIX),
})

export const { meters, kilograms, seconds, amperes, kelvin, moles, candelas, radians, steradians, bits } =
  createSIBaseUnits(Measure)
