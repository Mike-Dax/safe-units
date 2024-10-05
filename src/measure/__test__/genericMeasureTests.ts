import { NumericOperations } from "../genericMeasure"
import { createMeasureType } from "../genericMeasureFactory"
import { wrapBinaryFn, wrapReducerFn, wrapSpreadFn, wrapUnaryFn } from "../genericMeasureUtils"
import { Measure } from "../numberMeasure"
import { UnitSystem } from "../unitSystem"

describe("Generic measures", () => {
  const unitSystem = UnitSystem.from({
    length: "m",
    mass: "kg",
  })

  describe("function wrappers", () => {
    const meters = Measure.dimension(unitSystem, "length", "meter", "meters", "m")
    const add = (left: number, right: number) => left + right

    it("unary wrapper", () => {
      const increment = wrapUnaryFn((x: number) => x + 1)
      const result = increment(Measure.from(10, meters))
      expect(result).toEqual(Measure.from(11, meters))
    })

    it("binary wrapper", () => {
      const measureAdd = wrapBinaryFn(add)
      const result = measureAdd(Measure.from(5, meters), Measure.from(10, meters))
      expect(result).toEqual(Measure.from(15, meters))
    })

    it("spread wrapper", () => {
      const sum = wrapSpreadFn((...values: number[]) => values.reduce(add, 0))
      const result = sum(Measure.from(5, meters), Measure.from(10, meters), Measure.from(15, meters))
      expect(result).toEqual(Measure.from(30, meters))
    })

    it("reducer wrapper", () => {
      const sum = wrapReducerFn(add)
      const result = sum(Measure.from(5, meters), Measure.from(10, meters), Measure.from(15, meters))
      expect(result).toEqual(Measure.from(30, meters))
    })
  })

  describe("static methods", () => {
    const numericOps: NumericOperations<number> = {
      zero: () => 0,
      one: () => 1,
      neg: x => -x,
      abs: x => Math.abs(x),
      add: (x, y) => x + y,
      sub: (x, y) => x - y,
      mult: (x, y) => x * y,
      div: (x, y) => x / y,
      round: x => Math.round(x),
      floor: x => Math.floor(x),
      pow: (x, y) => Math.pow(x, y),
      reciprocal: x => 1 / x,
      compare: (x, y) => x - y,
      format: x => `${x}`,
    }

    it("should attach static methods when given", () => {
      const LocalMeasure = createMeasureType(numericOps, {
        staticMethod: () => "method",
      })
      expect("staticMethod" in LocalMeasure).toBe(true)
    })

    it("should not attach static methods when omitted", () => {
      const LocalMeasure = createMeasureType(numericOps)
      expect("staticMethod" in LocalMeasure).toBe(false)
    })
  })
})
