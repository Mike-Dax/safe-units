import { feet, hours, kilo, grams, meters, seconds } from "../../unit"
import { Measure } from "../numberMeasure"
import { represent } from "../represent"

describe(`represent`, () => {
  it("efficient precision", () => {
    // The user may provide an input range to lerp between, eg 0 - 255 is 0 - 100, then we get to this 'actual value'
    const value = 1.1945

    // The user provides a unit where 1 value is 1 of these
    // const inputUnit = kilo(meters)
    const inputUnit = kilo(meters)
    const inputAmountEach = 1
    const inputMeasure = Measure.from(inputAmountEach, inputUnit) // where each is a quarter kilometer

    // They provide an output unit, and a default unit of precision
    const outputUnit = meters
    const outputUnitPrecision = 100 // must be non-zero
    const outputUnitCombined = Measure.from(outputUnitPrecision, outputUnit)

    const memoisedFactor = inputMeasure.valueIn(outputUnitCombined)
    const memoisedRecipricol = 1 / outputUnitPrecision

    const format = (num: number) => `${Math.round(memoisedFactor * num) / memoisedRecipricol} ${outputUnit.symbol}`
    const scale = (num: number) => (memoisedFactor * num) / memoisedRecipricol

    // Just before feeding into the charts, we can run the `scale` operation, then when formatting the axis lines, mouse over, etc,
    // we can use the `format` operation.
    console.log(format(value), scale(value))
  })

  it(`can automatically determine aesthetically pleasing units`, () => {
    const kph = kilo(meters).per(hours)

    console.log(`km/h:`, represent(kph, [kilo(meters), hours]).symbol)
    console.log(`m/h:`, represent(kph, [meters, hours]).symbol)
    console.log(`m/s:`, represent(kph, [meters, seconds]).symbol)
    console.log(`km/s:`, represent(kph, [kilo(meters), seconds]).symbol)
    console.log(`length / time:`, represent(kph, []).symbol)
    console.log(`ft / time:`, represent(kph, [feet]).symbol)
    console.log(`length / hours:`, represent(kph, [hours]).symbol)

    console.log(
      `m³/h into km³/s:`,
      represent(meters.times(meters).times(meters).per(hours), [kilo(meters), seconds]).symbol,
    )

    // -- Derived units --
    // integration -> velocity -> position
  })
})
