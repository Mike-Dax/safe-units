import { Measure } from "../../measure/numberMeasure"
import { degrees, piRadians } from "../angle"
import { SIUnitSystem, meters, radians } from "../base"
import * as Trig from "../trig"

describe("Trig", () => {
  const zeroRadians = Measure.from(0, radians)
  const zero = Measure.dimensionless(SIUnitSystem, 0)

  it("normal", () => {
    expect(Trig.cos(zeroRadians)).toEqual(Measure.dimensionless(SIUnitSystem, 1))
    expect(Trig.sin(zeroRadians)).toEqual(zero)
    expect(Trig.tan(zeroRadians)).toEqual(zero)
  })

  it("inverse", () => {
    expect(Trig.acos(zero)).toEqual(Measure.from(0.5, piRadians))
    expect(Trig.asin(zero)).toEqual(zeroRadians)
    expect(Trig.atan(zero)).toEqual(zeroRadians)
    expect(Trig.atan2(Measure.from(5, meters), Measure.from(5, meters))).toEqual(Measure.from(45, degrees))
  })
})
