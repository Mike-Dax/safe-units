import { Measure } from "../numberMeasure"
import { UnitSystem } from "../unitSystem"

const ALLOW_SI_MULTIPLE_PREFIX = {
  SI_MULTIPLE: true,
} as const

const ALLOW_SI_SUBMULTIPLE_PREFIX = {
  SI_SUBMULTIPLE: true,
} as const

const ALLOW_SI_PREFIX = {
  SI_MULTIPLE: true,
  SI_SUBMULTIPLE: true,
} as const

const DISALLOW_ANY_PREFIX = {} as const

const ALLOW_BINARY_MULTIPLE_PREFIX = {
  BINARY_MULTIPLE: true,
} as const

const ALLOW_BINARY_OR_SI_MULTIPLE_PREFIX = {
  SI_MULTIPLE: true,
  BINARY_MULTIPLE: true,
} as const

const unitSystem = UnitSystem.from({
  length: "m",
  memory: "b",
})

const milli = Measure.prefix("milli", "m", 1e-3, ALLOW_SI_SUBMULTIPLE_PREFIX)
const kilo = Measure.prefix("kilo", "k", 1e3, ALLOW_SI_MULTIPLE_PREFIX)

const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m", ALLOW_SI_PREFIX)
const feet = Measure.from(0.3048, meters, "foot", "feet", "ft", DISALLOW_ANY_PREFIX)
const inches = Measure.from(1 / 12, feet, "inch", "inches", "in", DISALLOW_ANY_PREFIX)

const bits = Measure.dimension(unitSystem, "memory", "bit", "bits", "b", ALLOW_BINARY_OR_SI_MULTIPLE_PREFIX)
const bytes = Measure.from(8, bits, "byte", "bytes", "B", ALLOW_BINARY_OR_SI_MULTIPLE_PREFIX)

const kibi = Measure.prefix("kibi", "Ki", 1 << 10, ALLOW_BINARY_MULTIPLE_PREFIX)
const mebi = Measure.prefix("mebi", "Mi", 1 << 20, ALLOW_BINARY_MULTIPLE_PREFIX)

describe("Prefixes", () => {
  it("correctly converts SI units with their prefixes", () => {
    expect(meters.createConverterTo(milli(meters))(1)).toBe(1000)
    expect(kilo(meters).createConverterTo(meters)(1)).toBe(1000)
  })
  it("allows SI multiples on byte units", () => {
    expect(kilo(bytes).createConverterTo(bytes)(1)).toBe(1000)
    expect(kibi(bytes).createConverterTo(bytes)(1)).toBe(1024)

    expect(kilo(bytes).createConverterTo(bits)(1)).toBe(8000)
  })
  it("throws when trying to double-prefix a unit", () => {
    expect(() => {
      const a = meters
      const b = milli(a)

      // @ts-expect-error once the milli is applied, the kilo prefix can't be applied
      const c = kilo(b)
    }).toThrow()
  })
  it("throws when trying to use an SI prefix on a non-SI unit", () => {
    expect(() => {
      const res = milli(inches)
    }).toThrow()
  })
  it("throws when trying to use a binary prefix on an SI unit", () => {
    expect(() => {
      // @ts-expect-error can't use a binary prefix on an SI unit
      const res = mebi(meters)
    }).toThrow()
  })

  it("runtime matches SI multiples on byte units", () => {
    expect(kilo(bytes).createConverterTo(bytes)(1)).toBe(1000)
    expect(kibi(bytes).createConverterTo(bytes)(1)).toBe(1024)

    expect(kilo(bytes).createConverterTo(bits)(1)).toBe(8000)
  })
  it("runtime disallows matching when trying to double-prefix a unit", () => {
    const a = meters
    const b = milli(a)

    const resA = milli.canApply(a)
    const resB = milli.canApply(b)

    expect(resA).toBe(true)
    expect(resB).toBe(false)
  })
  it("runtime disallows matching when trying to use an SI prefix on a non-SI unit", () => {
    const res = milli.canApply(inches)

    expect(res).toBe(false)
  })
  it("runtime disallows matching when trying to use a binary prefix on an SI unit", () => {
    const res = mebi.canApply(meters)

    expect(res).toBe(false)
  })
})
