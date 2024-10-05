import { Measure } from "../measure/numberMeasure"
import { radians } from "./base"
import { PlaneAngle } from "./quantities"

export const piRadians: PlaneAngle = Measure.from(Math.PI, radians, "pi radian", "pi radians", "pi rad")
export const tauRadians: PlaneAngle = Measure.from(2, piRadians, "tau radian", "tau radians", "tau rad")

export const degrees: PlaneAngle = Measure.from(1 / 180, piRadians, "degree", "degrees", "deg")
export const arcMinutes: PlaneAngle = Measure.from(1 / 60, degrees, "arc minute", "arc minutes", "arcmin")
export const arcSeconds: PlaneAngle = Measure.from(1 / 60, arcMinutes, "arc second", "arc seconds", "arcsec")
