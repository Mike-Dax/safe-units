import { NumericOperations } from "../genericMeasure"
import { createMeasureType } from "../genericMeasureFactory"
import { wrapBinaryFn, wrapReducerFn, wrapSpreadFn, wrapUnaryFn } from "../genericMeasureUtils"
import { Measure } from "../numberMeasure"
import { UnitSystem } from "../unitSystem"

describe("Formatting helpers", () => {
  const ALLOW_SI_PREFIX = {
    PREFIX_SI: true,
  } as const

  const unitSystem = UnitSystem.from({
    length: "m",
    mass: "kg",
  })

  const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX)
  const feet = Measure.of(0.3048, meters, "foot", "feet", "ft")

  it("symbol getter", () => {
    const symbol = meters.getSymbol()
    expect(symbol).toEqual("m")
  })

  it("singular and plural names", () => {
    const nameFormatter = meters.createNameFormatter()

    const one = nameFormatter(1)
    const zero = nameFormatter(0)
    const negOne = nameFormatter(-1)
    const two = nameFormatter(2)

    expect(one).toEqual("meter")
    expect(zero).toEqual("meters")
    expect(negOne).toEqual("meters")
    expect(two).toEqual("meters")
  })

  it("meters to feet conversion", () => {
    const metersToFeet = meters.createConverterTo(feet)

    const one = metersToFeet(1)
    const zero = metersToFeet(0)
    const negOne = metersToFeet(-1)
    const two = metersToFeet(2)

    expect(one).toBeCloseTo(3.2808)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-3.2808)
    expect(two).toBeCloseTo(6.561)
  })

  it("feet to meters conversion", () => {
    const feetToMeters = feet.createConverterTo(meters)

    const one = feetToMeters(1)
    const zero = feetToMeters(0)
    const negOne = feetToMeters(-1)
    const two = feetToMeters(2)

    expect(one).toBeCloseTo(0.3048)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-0.3048)
    expect(two).toBeCloseTo(0.6096)
  })

  it("meters to nearest 1 foot conversion", () => {
    const metersToNearestOneFoot = meters.createToNearestConverter(1, feet)

    const one = metersToNearestOneFoot(1)
    const zero = metersToNearestOneFoot(0)
    const negOne = metersToNearestOneFoot(-1)
    const two = metersToNearestOneFoot(2)

    expect(one).toBeCloseTo(3)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-3)
    expect(two).toBeCloseTo(7)
  })

  it("meters to nearest 0.25 feet conversion", () => {
    const metersToNearestOneFoot = meters.createToNearestConverter(0.25, feet)

    const one = metersToNearestOneFoot(1)
    const onePointOne = metersToNearestOneFoot(1.1)
    const onePointTwo = metersToNearestOneFoot(1.2)
    const onePointThree = metersToNearestOneFoot(1.3)
    const onePointFour = metersToNearestOneFoot(1.4)
    const onePointFive = metersToNearestOneFoot(1.5)
    const onePointSevenFive = metersToNearestOneFoot(1.75)
    const zero = metersToNearestOneFoot(0)
    const negOne = metersToNearestOneFoot(-1)
    const two = metersToNearestOneFoot(2)

    expect(one).toBeCloseTo(3.25)
    expect(onePointOne).toBeCloseTo(3.5)
    expect(onePointTwo).toBeCloseTo(4)
    expect(onePointThree).toBeCloseTo(4.25)
    expect(onePointFour).toBeCloseTo(4.5)
    expect(onePointFive).toBeCloseTo(5)
    expect(onePointSevenFive).toBeCloseTo(5.75)
    expect(zero).toBeCloseTo(0)
    expect(negOne).toBeCloseTo(-3.25)
    expect(two).toBeCloseTo(6.5)
  })

  it("auto-prefixing formatter for meters", () => {
    const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_PREFIX)
    const centi = Measure.prefix("centi", "c", 0.01, ALLOW_SI_PREFIX)
    const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_PREFIX)
    const micro = Measure.prefix("micro", "µ", 1e-6, ALLOW_SI_PREFIX)

    const autoPrefixer = meters.createDynamicFormatter([
      meters,
      kilo(meters),
      centi(meters),
      milli(meters),
      micro(meters),
    ])

    const vals = [
      autoPrefixer(0), // m -> 0µm
      autoPrefixer(0.00001), // m -> 10µm
      autoPrefixer(0.00005), // m -> 50µm
      autoPrefixer(0.0001), // m -> 100µm
      autoPrefixer(0.0005), // m -> 500µm
      autoPrefixer(0.001), // m -> 1mm
      autoPrefixer(0.005), // m -> 5mm
      autoPrefixer(0.01), // m -> 1cm
      autoPrefixer(0.05), // m -> 5cm
      autoPrefixer(0.1), // m -> 10cm
      autoPrefixer(0.5), // m -> 50cm
      autoPrefixer(1), // m -> 1m
      autoPrefixer(5), // m -> 5m
      autoPrefixer(10), // m -> 10m
      autoPrefixer(50), // m -> 50m
      autoPrefixer(100), // m -> 100m
      autoPrefixer(500), // m -> 500m
      autoPrefixer(1_000), // m -> 1km
      autoPrefixer(5_000), // m -> 5km
      autoPrefixer(10_000), // m -> 10km
      autoPrefixer(50_000), // m -> 50km
      autoPrefixer(100_000), // m -> 100km
      autoPrefixer(500_000), // m -> 500km
    ].map(({ value, symbol }) => `${value}${symbol}`)

    expect(vals).toEqual([
      "0µm", //
      "10µm",
      "50µm",
      "100µm",
      "500µm",
      "1mm",
      "5mm",
      "1cm",
      "5cm",
      "10cm",
      "50cm",
      "1m",
      "5m",
      "10m",
      "50m",
      "100m",
      "500m",
      "1km",
      "5km",
      "10km",
      "50km",
      "100km",
      "500km",
    ])
  })
})
