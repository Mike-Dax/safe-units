import { PrefixFn } from "../measure/genericMeasureUtils"
import { Measure } from "../measure/numberMeasure"
import { amperes, candelas, grams, meters, moles, seconds, steradians } from "./base"
import * as Quantity from "./quantities"

// Prefixes
export const ALLOW_SI_SUBMULTIPLE_PREFIX = {
  PREFIX_SI_SUBMULTIPLE: true,
} as const
export const ALLOW_SI_MULTIPLE_PREFIX = {
  PREFIX_SI_MULTIPLE: true,
} as const
export const ALLOW_SI_PREFIX = {
  PREFIX_SI_SUBMULTIPLE: true,
  PREFIX_SI_MULTIPLE: true,
} as const
export type SIPrefix = typeof ALLOW_SI_PREFIX
export type SIPrefixMultiple = typeof ALLOW_SI_MULTIPLE_PREFIX
export type SIPrefixSubMultiple = typeof ALLOW_SI_SUBMULTIPLE_PREFIX

// HACKHACK: Explicitly type this so we can import PrefixFunction and avoid absolute paths in the generated typings.
export const yotta: PrefixFn<SIPrefixMultiple> = Measure.prefix("yotta", "Y", 1e24, ALLOW_SI_MULTIPLE_PREFIX)
export const zetta = Measure.prefix("zetta", "Z", 1e21, ALLOW_SI_MULTIPLE_PREFIX)
export const exa = Measure.prefix("exa", "E", 1e18, ALLOW_SI_MULTIPLE_PREFIX)
export const peta = Measure.prefix("peta", "P", 1e15, ALLOW_SI_MULTIPLE_PREFIX)
export const tera = Measure.prefix("tera", "T", 1e12, ALLOW_SI_MULTIPLE_PREFIX)
export const giga = Measure.prefix("giga", "G", 1e9, ALLOW_SI_MULTIPLE_PREFIX)
export const mega = Measure.prefix("mega", "M", 1e6, ALLOW_SI_MULTIPLE_PREFIX)
export const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_MULTIPLE_PREFIX)
export const hecto = Measure.prefix("hecto", "h", 100, ALLOW_SI_MULTIPLE_PREFIX)
export const deca = Measure.prefix("deca", "da", 10, ALLOW_SI_MULTIPLE_PREFIX)

// Submultiples
export const deci = Measure.prefix("deci", "d", 0.1, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const centi = Measure.prefix("centi", "c", 0.01, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const micro = Measure.prefix("micro", "µ", 1e-6, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const nano = Measure.prefix("nano", "n", 1e-9, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const pico = Measure.prefix("pico", "p", 1e-12, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const femto = Measure.prefix("femto", "f", 1e-15, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const atto = Measure.prefix("atto", "a", 1e-18, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const zepto = Measure.prefix("zepto", "z", 1e-21, ALLOW_SI_SUBMULTIPLE_PREFIX)
export const yocto = Measure.prefix("yocto", "y", 1e-24, ALLOW_SI_SUBMULTIPLE_PREFIX)

export const hertz: Quantity.Frequency = seconds.inverse().withIdentifiers("hertz", "hertz", "Hz")
export const newtons: Quantity.Force = kilo(grams)
  .times(meters.per(seconds.squared()))
  .withIdentifiers("newton", "newtons", "N")
export const pascals: Quantity.Pressure = newtons.per(meters.squared()).withIdentifiers("pascal", "pascals", "Pa")
export const joules: Quantity.Energy = newtons.times(meters).withIdentifiers("joule", "joules", "J")
export const watts: Quantity.Power = joules.per(seconds).withIdentifiers("watt", "watts", "W")
export const volts: Quantity.Voltage = watts.per(amperes).withIdentifiers("volt", "volts", "V")
export const coulombs: Quantity.ElectricCharge = amperes.times(seconds).withIdentifiers("coulomb", "coulombs", "C")
export const farads: Quantity.ElectricalCapacitance = coulombs.per(volts).withIdentifiers("farad", "farads", "F")
export const ohms: Quantity.ElectricalResistance = volts.per(amperes).withIdentifiers("ohm", "ohms", "Ω")
export const siemens: Quantity.ElectricalConductance = amperes.per(volts).withIdentifiers("siemens", "siemens", "S")
export const henrys: Quantity.ElectricalInductance = ohms.times(seconds).withIdentifiers("henry", "henries", "H")
export const webers: Quantity.MagneticFlux = joules.per(amperes).withIdentifiers("weber", "webers", "Wb")
export const teslas: Quantity.MagneticFluxDensity = volts
  .times(seconds.per(meters.squared()))
  .withIdentifiers("tesla", "teslas", "T")
export const sieverts: Quantity.RadiationDose = joules.per(kilo(grams)).withIdentifiers("sievert", "sieverts", "Sv")
export const katals: Quantity.CatalyticActivity = moles.per(seconds).withIdentifiers("katal", "katals", "kat")
export const lumens: Quantity.LuminousFlux = candelas.times(steradians).withIdentifiers("lumen", "lumens", "lm")
export const luxes: Quantity.Illuminance = lumens.per(meters.squared()).withIdentifiers("lux", "luxes", "lx")
