import { GenericMeasureType } from "../measure"
import { Measure } from "../measure/numberMeasure"
import { UnitSystem } from "../measure/unitSystem"
import { ALLOW_SI_PREFIX } from "./metric"

const SIUnitSystemBasis = {
  length: "m",
  mass: "g",
  time: "s",
  current: "A",
  temperatureDifference: "K",
  thermodynamicTemperature: "K",
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
  grams: measure.dimension(SIUnitSystem, "mass", "gram", "grams", "g", ALLOW_SI_PREFIX),
  seconds: measure.dimension(SIUnitSystem, "time", "second", "seconds", "s", ALLOW_SI_PREFIX),
  amperes: measure.dimension(SIUnitSystem, "current", "ampere", "amperes", "A", ALLOW_SI_PREFIX),
  kelvinDifference: measure.dimension(
    SIUnitSystem,
    "temperatureDifference",
    "kelvin difference",
    "kelvins difference",
    "ΔK",
    ALLOW_SI_PREFIX,
  ),
  kelvin: measure.dimension(
    SIUnitSystem,
    "thermodynamicTemperature", // takes into account constant offsets
    "kelvin",
    "kelvins",
    "K",
    ALLOW_SI_PREFIX,
  ),
  moles: measure.dimension(SIUnitSystem, "substance", "mole", "moles", "mol", ALLOW_SI_PREFIX),
  candelas: measure.dimension(SIUnitSystem, "intensity", "candela", "candelas", "cd", ALLOW_SI_PREFIX),
  radians: measure.dimension(SIUnitSystem, "planeAngle", "radian", "radians", "rad", ALLOW_SI_PREFIX),
  steradians: measure.dimension(SIUnitSystem, "solidAngle", "steradian", "steradians", "sr", ALLOW_SI_PREFIX),
  bits: measure.dimension(SIUnitSystem, "memory", "bit", "bits", "b", ALLOW_SI_PREFIX),
})

export const { meters, grams, seconds, amperes, kelvinDifference, kelvin, moles, candelas, radians, steradians, bits } =
  createSIBaseUnits(Measure)
