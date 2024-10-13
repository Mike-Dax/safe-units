import { Measure } from "../numberMeasure"
import { UnitSystem } from "../unitSystem"

describe("Individual measure formatters", () => {
  const ALLOW_SI_PREFIX = {
    PREFIX_SI: true,
  } as const

  const unitSystem = UnitSystem.from({
    length: "m",
    mass: "g",
    time: "s",
  })

  const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_PREFIX)

  const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX)
  const gram = Measure.dimension(unitSystem, "mass", "gram", "grams", "g", ALLOW_SI_PREFIX)
  const feet = Measure.from(0.3048, meters, "foot", "feet", "ft")
  const inches = Measure.from(1 / 12, feet, "inch", "inches", "in")

  const seconds = Measure.dimension(unitSystem, "time", "second", "seconds", "s")
  const minutes = Measure.from(60, seconds, "minute", "minutes", "m")
  const hours = Measure.from(60, minutes, "hour", "hours", "hr")

  const corpus: {
    measure: Measure<any, any, any>
    pluralName: string
    singularName: string
    symbol: string
  }[] = [
    {
      measure: meters, // simple
      pluralName: "meters",
      singularName: "meter",
      symbol: "m",
    },
    {
      measure: milli(meters), // prefix handling
      pluralName: "millimeters",
      singularName: "millimeter",
      symbol: "mm",
    },
    {
      measure: meters.pow(2).over(gram.times(seconds)),
      pluralName: "meters squared per (gram second)", // gram second vs second gram is interesting?
      singularName: "meter squared per (gram second)",
      symbol: "m²/(g·s)",
    },
    {
      measure: meters.pow(1).over(seconds.pow(6)),
      pluralName: "meters per second to the sixth",
      singularName: "meter per second to the sixth",
      symbol: "m/s⁶", // to the 1 is dropped to nothing
    },
  ]

  for (const example of corpus) {
    it(`it correctly handles naming and symbols for ${example.pluralName}`, () => {
      const symbolFormatter = Measure.createMeasureFormatter()
      const symbolName = example.measure.format(false, symbolFormatter)

      const nameFormatter = Measure.createMeasureFormatter({
        unitText: "name",
        times: " ",
        per: " per ",
        pow: "name",
        parentheses: false,
      })
      const pluralName = example.measure.format(true, nameFormatter)
      const singularName = example.measure.format(false, nameFormatter)

      expect(symbolName).toBe(example.symbol)
      expect(pluralName).toBe(example.pluralName)
      expect(singularName).toBe(example.singularName)
    })
  }
})

describe("Complex Formatting helpers", () => {
  const ALLOW_SI_PREFIX = {
    PREFIX_SI: true,
  } as const

  const unitSystem = UnitSystem.from({
    length: "m",
    mass: "kg",
    time: "s",
  })

  const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX)
  const kilogram = Measure.dimension(unitSystem, "mass", "gram", "grams", "g", ALLOW_SI_PREFIX)
  const feet = Measure.from(0.3048, meters, "foot", "feet", "ft")
  const inches = Measure.from(1 / 12, feet, "inch", "inches", "in")

  const seconds = Measure.dimension(unitSystem, "time", "second", "seconds", "s")
  const minutes = Measure.from(60, seconds, "minute", "minutes", "m")
  const hours = Measure.from(60, minutes, "hour", "hours", "hr")

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
    const metersToNearestOneFoot = meters.createConverterTo(feet)
    const valueFormatter = feet.createValueFormatter({ valueDisplay: "nearest", value: 1 })

    const one = valueFormatter(metersToNearestOneFoot(1))
    const zero = valueFormatter(metersToNearestOneFoot(0))
    const negOne = valueFormatter(metersToNearestOneFoot(-1))
    const two = valueFormatter(metersToNearestOneFoot(2))

    expect(one).toBe("3")
    expect(zero).toBe("0")
    expect(negOne).toBe("-3")
    expect(two).toBe("7")
  })

  it("meters to nearest 0.25 feet conversion", () => {
    const metersToNearestOneFoot = meters.createConverterTo(feet)
    const valueFormatter = feet.createValueFormatter({ valueDisplay: "nearest", value: 0.25 })

    const one = valueFormatter(metersToNearestOneFoot(1))
    const onePointOne = valueFormatter(metersToNearestOneFoot(1.1))
    const onePointTwo = valueFormatter(metersToNearestOneFoot(1.2))
    const onePointThree = valueFormatter(metersToNearestOneFoot(1.3))
    const onePointFour = valueFormatter(metersToNearestOneFoot(1.4))
    const onePointFive = valueFormatter(metersToNearestOneFoot(1.5))
    const onePointSevenFive = valueFormatter(metersToNearestOneFoot(1.75))
    const zero = valueFormatter(metersToNearestOneFoot(0))
    const negOne = valueFormatter(metersToNearestOneFoot(-1))
    const two = valueFormatter(metersToNearestOneFoot(2))

    expect(one).toBe("3.25")
    expect(onePointOne).toBe("3.5")
    expect(onePointTwo).toBe("4")
    expect(onePointThree).toBe("4.25")
    expect(onePointFour).toBe("4.5")
    expect(onePointFive).toBe("5")
    expect(onePointSevenFive).toBe("5.75")
    expect(zero).toBe("0")
    expect(negOne).toBe("-3.25")
    expect(two).toBe("6.5")
  })

  it("auto-prefixing formatter for meters", () => {
    const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_PREFIX)
    const centi = Measure.prefix("centi", "c", 0.01, ALLOW_SI_PREFIX)
    const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_PREFIX)
    const micro = Measure.prefix("micro", "µ", 1e-6, ALLOW_SI_PREFIX)

    const autoPrefixer = meters.createDynamicFormatter(
      [
        meters, //
        kilo(meters),
        centi(meters),
        milli(meters),
        micro(meters),
      ],
      { valueDisplay: "full-precision" },
      Measure.createMeasureFormatter(),
    )

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
    ].map(({ formatted, measure }) => `${formatted}${measure}`)

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

  it("auto-prefixing formatter to nearest 0.25", () => {
    const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_PREFIX)
    const centi = Measure.prefix("centi", "c", 0.01, ALLOW_SI_PREFIX)
    const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_PREFIX)
    const micro = Measure.prefix("micro", "µ", 1e-6, ALLOW_SI_PREFIX)

    const autoPrefixer = meters.createDynamicFormatter(
      [
        meters, //
        kilo(meters),
        centi(meters),
        milli(meters),
        micro(meters),
      ],
      { valueDisplay: "full-precision" },
      Measure.createMeasureFormatter(),
    )

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
    ].map(({ formatted, measure }) => `${formatted}${measure}`)

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

  it("multi-unit formatter for feet and inches", () => {
    const autoPrefixer = meters.createMultiUnitFormatter(
      [
        feet, //
        inches,
      ],
      { valueDisplay: "nearest", value: 1 },
      Measure.createMeasureFormatter(),
    )

    const one = autoPrefixer(1)
    const zero = autoPrefixer(0)
    const negOne = autoPrefixer(-1)
    const two = autoPrefixer(2.1)

    expect(one[0].converted).toBeCloseTo(3)
    expect(one[0].formatted).toBe("3")
    expect(one[0].measure).toBe("ft")
    expect(one[1].converted).toBeCloseTo(3.37)
    expect(one[1].formatted).toBe("3")
    expect(one[1].measure).toBe("in")

    // zero provides 0 of the smallest unit
    expect(zero[0].converted).toBeCloseTo(0)
    expect(zero[0].formatted).toBe("0")
    expect(zero[0].measure).toBe("in")

    // negative numbers have the first non-zero element as a zero
    expect(negOne[0].converted).toBeCloseTo(-3)
    expect(negOne[0].formatted).toBe("-3")
    expect(negOne[0].measure).toBe("ft")
    expect(negOne[1].converted).toBeCloseTo(3.37)
    expect(negOne[1].formatted).toBe("3")
    expect(negOne[1].measure).toBe("in")

    expect(two[0].converted).toBeCloseTo(6)
    expect(two[0].formatted).toBe("6")
    expect(two[0].measure).toBe("ft")
    expect(two[1].converted).toBeCloseTo(10.677)
    expect(two[1].formatted).toBe("11")
    expect(two[1].measure).toBe("in")
  })

  it("multi-unit formatter for feet and inches with custom symbols", () => {
    const autoPrefixer = meters.createMultiUnitFormatter(
      [
        feet.withIdentifiers("foot", "feet", `"`), //
        inches.withIdentifiers("inch", "inches", `'`),
      ],
      { valueDisplay: "nearest", value: 1 },
      Measure.createMeasureFormatter(),
    )

    const sixFour = autoPrefixer(1.92)
      .map(({ formatted, measure }) => `${formatted}${measure}`)
      .join("")

    expect(sixFour).toBe(`6"4'`)
  })

  it("multi-unit toNearest naming formatter for hours, minutes, seconds", () => {
    const autoPrefixer = seconds.createMultiUnitFormatter(
      [minutes, hours, seconds],
      {
        valueDisplay: "nearest",
        value: 0.25,
      },
      Measure.createMeasureFormatter({
        unitText: "name",
        pow: "name",
      }),
    )

    const one = autoPrefixer(525675.285)

    expect(one).toEqual([
      { converted: 146, formatted: "146", measure: "hours" },
      { converted: 1, formatted: "1", measure: "minute" },
      { converted: 15.285000000032596, formatted: "15.25", measure: "seconds" },
    ])
  })
})

// Pass a formatter to createMultiUnitFormatter, createDynamicFormatter
