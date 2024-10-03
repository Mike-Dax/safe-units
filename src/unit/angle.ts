import { Measure } from "../measure/numberMeasure"
import { radians } from "./base"
import { PlaneAngle } from "./quantities"

export const piRadians: PlaneAngle = Measure.of(Math.PI, radians, "pi radian", "pi radians", "pi rad")
export const tauRadians: PlaneAngle = Measure.of(2, piRadians, "tau radian", "tau radians", "tau rad")

export const degrees: PlaneAngle = Measure.of(1 / 180, piRadians, "degree", "degrees", "deg")
export const arcMinutes: PlaneAngle = Measure.of(1 / 60, degrees, "arc minute", "arc minutes", "arcmin")
export const arcSeconds: PlaneAngle = Measure.of(1 / 60, arcMinutes, "arc second", "arc seconds", "arcsec")
