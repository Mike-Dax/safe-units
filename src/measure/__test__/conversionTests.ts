import { Measure } from "../numberMeasure"
import { UnitSystem } from "../unitSystem"

const ALLOW_SI_PREFIX = {
  PREFIX_SI: true,
} as const

const DISALLOW_PREFIXES = {
  PREFIX_SI: false,
} as const

const unitSystem = UnitSystem.from({
  length: "m",
  mass: "g",
  time: "s",
  temperature: "K",
})

const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_PREFIX)
const centi = Measure.prefix("centi", "c", 0.01, ALLOW_SI_PREFIX)
const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_PREFIX)
const micro = Measure.prefix("micro", "µ", 1e-6, ALLOW_SI_PREFIX)

const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX)
const gram = Measure.dimension(unitSystem, "mass", "gram", "grams", "g", ALLOW_SI_PREFIX)
const feet = Measure.from(0.3048, meters, "foot", "feet", "ft", DISALLOW_PREFIXES)
const inches = Measure.from(1 / 12, feet, "inch", "inches", "in", DISALLOW_PREFIXES)

const seconds = Measure.dimension(unitSystem, "time", "second", "seconds", "s", ALLOW_SI_PREFIX)
const minutes = Measure.from(60, seconds, "minute", "minutes", "m", DISALLOW_PREFIXES)
const hours = Measure.from(60, minutes, "hour", "hours", "hr", DISALLOW_PREFIXES)

const newtons = kilo(gram)
  .times(meters.per(seconds.squared()))
  .withIdentifiers("newton", "newtons", "N", ALLOW_SI_PREFIX)
const joules = newtons.times(meters).withIdentifiers("joule", "joules", "J", ALLOW_SI_PREFIX)

const kelvin = Measure.dimension(
  unitSystem, //
  "temperature",
  "kelvin",
  "kelvins",
  "K",
  ALLOW_SI_PREFIX,
)

const celsius = Measure.offsetFrom(
  kelvin, //
  1,
  273.15,
  "degree Celsius",
  "degrees Celsius",
  "°C",
).redirectIfManipulated(
  Measure.from(
    1,
    kelvin, //
    "degree Celsius difference",
    "degrees Celsius difference",
    "Δ°C",
  ),
)

const fahrenheit = Measure.offsetFrom(
  kelvin, //
  5 / 9,
  459.67,
  "degree Fahrenheit",
  "degrees Fahrenheit",
  "°F",
).redirectIfManipulated(
  Measure.from(
    5 / 9,
    kelvin, //
    "degree Fahrenheit difference",
    "degrees Fahrenheit difference",
    "Δ°F",
  ),
)
describe("Conversion tests", () => {
  it("meters to feet conversion", () => {
    const converter = meters.createConverterTo(feet)

    expect(meters.isCompatibleWith(feet)).toBe(true)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo(3.2808)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-3.2808)
    expect(two).toBeCloseTo(6.561)
  })

  it("meters to kelvin conversion", () => {
    // @ts-expect-error meters isn't compatible with kelvin
    const converter = meters.createConverterTo(kelvin)

    expect(meters.isCompatibleWith(kelvin)).toBe(false)
  })

  it("feet to meters conversion", () => {
    const converter = feet.createConverterTo(meters)

    expect(feet.isCompatibleWith(meters)).toBe(true)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo(0.3048)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-0.3048)
    expect(two).toBeCloseTo(0.6096)
  })

  it("celsius to kelvin conversion", () => {
    const converter = celsius.createConverterTo(kelvin)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const absZero = converter(-273.15)

    expect(one).toBeCloseTo(274.15)
    expect(zero).toBeCloseTo(273.15)
    expect(negOne).toBeCloseTo(272.15)
    expect(absZero).toBeCloseTo(0)
  })

  it("celsius per second to kelvin per second conversion", () => {
    const converter = celsius.per(seconds).createConverterTo(kelvin.per(seconds))

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo(1)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-1)
    expect(two).toBeCloseTo(2)
  })

  it("celsius to fahrenheit conversion", () => {
    const converter = celsius.createConverterTo(fahrenheit)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const zeroF = converter(-160 / 9)

    expect(one).toBeCloseTo(33.8)
    expect(zero).toBeCloseTo(32)
    expect(negOne).toBeCloseTo(30.2)
    expect(zeroF).toBeCloseTo(0)
  })

  it("fahrenheit to celsius conversion", () => {
    const converter = fahrenheit.createConverterTo(celsius)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo((1 - 32) / 1.8)
    expect(zero).toBeCloseTo((0 - 32) / 1.8)
    expect(negOne).toBeCloseTo((-1 - 32) / 1.8)
    expect(two).toBeCloseTo((2 - 32) / 1.8)
  })

  it("celsius to celsius conversion", () => {
    const converter = celsius.createConverterTo(celsius)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo(1)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-1)
    expect(two).toBeCloseTo(2)
  })

  it("celsius per millisecond to celsius per millisecond conversion", () => {
    const converter = celsius.per(milli(seconds)).createConverterTo(celsius.per(milli(seconds)))

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo(1)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-1)
    expect(two).toBeCloseTo(2)
  })

  it("celsius per millisecond to fahrenheit per second", () => {
    const a = celsius.per(milli(seconds))
    const b = fahrenheit.per(seconds)

    const converter = a.createConverterTo(b)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo(1800)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-1800)
    expect(two).toBeCloseTo(3600)
  })

  it("fahrenheit per millisecond to celsius per second", () => {
    const a = fahrenheit.per(milli(seconds))
    const b = celsius.per(seconds)

    const converter = a.createConverterTo(b)

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo((5 / 9) * 1000)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo((5 / 9) * -1000)
    expect(two).toBeCloseTo((5 / 9) * 2000)
  })

  it("degrees C difference to thermodynamic degrees F difference conversion", () => {
    const converter = celsius.per(seconds).createConverterTo(fahrenheit.per(seconds))

    const one = converter(1)
    const zero = converter(0)
    const negOne = converter(-1)
    const two = converter(2)

    expect(one).toBeCloseTo(1.8)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-1.8)
    expect(two).toBeCloseTo(3.6)
  })
})
